import { useEffect, useState } from "react";
import {
    BrowserProvider,
    Contract,
    formatEther,
    parseEther
} from "ethers";

import "./App.css";
import escrowAbi from "./abi/FreelanceEscrow.json";

// =====================================================
// CONTRACT ADDRESS
// =====================================================

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


// =====================================================
// APP
// =====================================================

function App() {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [account, setAccount] = useState("");

    const [client, setClient] = useState("");
    const [freelancer, setFreelancer] = useState("");
    const [arbitrator, setArbitrator] = useState("");

    const [role, setRole] = useState("");

    const [milestoneId, setMilestoneId] = useState("0");

    const [milestone, setMilestone] = useState(null);

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    // =================================================
    // ROLE HISTORY / EARNINGS
    // =================================================

    const [milestoneHistory, setMilestoneHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);

    const [freelancerTotalEarned, setFreelancerTotalEarned] =
        useState(0n);

    const [freelancerCompletedCount, setFreelancerCompletedCount] =
        useState(0);

    const [clientTotalRefunded, setClientTotalRefunded] =
        useState(0n);

    const [clientTotalCreated, setClientTotalCreated] =
        useState(0);

    const [historyLoading, setHistoryLoading] = useState(false);

    // =================================================
    // CLIENT FORM
    // =================================================

    const [projectTitle, setProjectTitle] = useState("");

    const [projectDescription, setProjectDescription] =
        useState("");

    const [amount, setAmount] = useState("");

    const [deadline, setDeadline] = useState("");


    // =================================================
    // FREELANCER FORM
    // =================================================

    const [workDescription, setWorkDescription] =
        useState("");


    // =================================================
    // DISPUTE
    // =================================================

    const [disputeReason, setDisputeReason] =
        useState("");

    const [disputeFreelancerAmount, setDisputeFreelancerAmount] =
        useState("");

    const [disputeClientAmount, setDisputeClientAmount] =
        useState("");

    const [resolutionNote, setResolutionNote] =
        useState("");


    // =================================================
    // CONNECT WALLET
    // =================================================

    async function connectWallet() {

        try {

            if (!window.ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const browserProvider =
                new BrowserProvider(window.ethereum);

            await browserProvider.send(
                "eth_requestAccounts",
                []
            );

            const walletSigner =
                await browserProvider.getSigner();

            const walletAddress =
                await walletSigner.getAddress();

            const escrowContract =
                new Contract(
                    CONTRACT_ADDRESS,
                    escrowAbi.abi,
                    walletSigner
                );

            setProvider(browserProvider);
            setSigner(walletSigner);
            setContract(escrowContract);
            setAccount(walletAddress);

            await loadContractData(
                escrowContract,
                walletAddress
            );

            setStatus("Wallet connected successfully.");

        } catch (error) {

            console.error(error);

            setStatus(
                error.shortMessage ||
                error.message ||
                "Wallet connection failed."
            );
        }
    }


    // =================================================
    // LOAD CONTRACT DATA
    // =================================================

    async function loadContractData(
        escrowContract,
        walletAddress
    ) {

        try {

            const contractClient =
                await escrowContract.client();

            const contractFreelancer =
                await escrowContract.freelancer();

            const contractArbitrator =
                await escrowContract.arbitrator();

            setClient(contractClient);
            setFreelancer(contractFreelancer);
            setArbitrator(contractArbitrator);

            const lowerWallet =
                walletAddress.toLowerCase();

            if (
                lowerWallet ===
                contractClient.toLowerCase()
            ) {

                setRole("CLIENT");

            } else if (
                lowerWallet ===
                contractFreelancer.toLowerCase()
            ) {

                setRole("FREELANCER");

            } else if (
                lowerWallet ===
                contractArbitrator.toLowerCase()
            ) {

                setRole("ARBITRATOR");

            } else {

                setRole("USER");
            }

            await loadMilestone(
                escrowContract,
                milestoneId
            );

            await loadHistory(
                escrowContract
            );

        } catch (error) {

            console.error(
                "Unable to load contract data:",
                error
            );
        }
    }


    // =================================================
    // LOAD MILESTONE
    // =================================================

    async function loadMilestone(
        escrowContract = contract,
        id = milestoneId
    ) {

        if (!escrowContract) return;

        try {

            const data =
                await escrowContract.milestones(id);

            setMilestone(data);

        } catch (error) {

            console.error(
                "Unable to load milestone:",
                error
            );
        }
    }


    // =================================================
    // LOAD ROLE HISTORY
    // =================================================

    async function loadHistory(escrowContract = contract) {
        if (!escrowContract) return;

        try {
            setHistoryLoading(true);

            const count = Number(
                await escrowContract.milestoneCount()
            );

            const milestonesList = [];

            for (let i = 0; i < count; i++) {
                const data =
                    await escrowContract.getMilestone(i);

                milestonesList.push({
                    id: Number(data.id),
                    title: data.title,
                    description: data.description,
                    amount: data.amount,
                    deadline: Number(data.deadline),
                    state: Number(data.state),
                    submissionURI: data.submissionURI,
                    createdAt: Number(data.createdAt)
                });
            }

            setMilestoneHistory(milestonesList);

            // -------------------------------------------------
            // PAYMENT / REFUND / DISPUTE HISTORY
            // -------------------------------------------------

            const paymentEvents = [];
            const latestBlock =
                await escrowContract.runner.provider.getBlockNumber();

            const releasedLogs =
                await escrowContract.queryFilter(
                    "PaymentReleased",
                    0,
                    latestBlock
                );

            for (const log of releasedLogs) {
                paymentEvents.push({
                    type: "PAYMENT_RELEASED",
                    milestoneId: Number(log.args.milestoneId),
                    amount: log.args.amount,
                    clientAmount: 0n,
                    freelancerAmount: log.args.amount,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash
                });
            }

            const disputeLogs =
                await escrowContract.queryFilter(
                    "DisputeResolved",
                    0,
                    latestBlock
                );

            for (const log of disputeLogs) {
                paymentEvents.push({
                    type: "DISPUTE_RESOLVED",
                    milestoneId: Number(log.args.milestoneId),
                    amount:
                        log.args.freelancerAmount +
                        log.args.clientAmount,
                    clientAmount: log.args.clientAmount,
                    freelancerAmount: log.args.freelancerAmount,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash
                });
            }

            const refundLogs =
                await escrowContract.queryFilter(
                    "RefundIssued",
                    0,
                    latestBlock
                );

            for (const log of refundLogs) {
                paymentEvents.push({
                    type: "REFUND_ISSUED",
                    milestoneId: Number(log.args.milestoneId),
                    amount: log.args.amount,
                    clientAmount: log.args.amount,
                    freelancerAmount: 0n,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash
                });
            }

            paymentEvents.sort(
                (a, b) =>
                    Number(b.blockNumber) -
                    Number(a.blockNumber)
            );

            // Add block timestamps for a readable history.
            const blockCache = {};

            for (const item of paymentEvents) {
                if (!blockCache[item.blockNumber]) {
                    blockCache[item.blockNumber] =
                        await escrowContract.runner.provider.getBlock(
                            item.blockNumber
                        );
                }

                item.timestamp =
                    blockCache[item.blockNumber]?.timestamp || 0;
            }

            setPaymentHistory(paymentEvents);

            // -------------------------------------------------
            // FREELANCER EARNINGS
            // -------------------------------------------------

            let earned = 0n;

            for (const item of paymentEvents) {
                earned += item.freelancerAmount;
            }

            setFreelancerTotalEarned(earned);

            const completedMilestones =
                milestonesList.filter(
                    (m) => m.state === 4
                ).length;

            setFreelancerCompletedCount(
                completedMilestones
            );

            // -------------------------------------------------
            // CLIENT SUMMARY
            // -------------------------------------------------

            setClientTotalCreated(
                milestonesList.length
            );

            let refunded = 0n;

            for (const item of paymentEvents) {
                refunded += item.clientAmount;
            }

            setClientTotalRefunded(refunded);

        } catch (error) {
            console.error(
                "Unable to load role history:",
                error
            );
        } finally {
            setHistoryLoading(false);
        }
    }


    // =================================================
    // GET STATUS NAME
    // =================================================

    function getStatusName(state) {

        const states = [
            "CREATED",
            "FUNDED",
            "IN_PROGRESS",
            "SUBMITTED",
            "COMPLETED",
            "DISPUTED",
            "REFUNDED"
        ];

        const number =
            Number(state);

        return states[number] ||
            `STATE ${number}`;
    }


    // =================================================
    // CREATE MILESTONE
    // =================================================

    async function createMilestone() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "CLIENT") {
            setStatus(
                "Only the client can create a milestone."
            );
            return;
        }

        if (!projectTitle.trim()) {
            setStatus(
                "Please enter a project title."
            );
            return;
        }

        if (!projectDescription.trim()) {
            setStatus(
                "Please enter a project description."
            );
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setStatus(
                "Please enter a valid ETH amount."
            );
            return;
        }

        if (!deadline) {
            setStatus(
                "Please select a deadline."
            );
            return;
        }

        try {

            setLoading(true);

            const amountWei =
                parseEther(amount);

            const deadlineTimestamp =
                Math.floor(
                    new Date(deadline).getTime() / 1000
                );

            if (
                deadlineTimestamp <=
                Math.floor(Date.now() / 1000)
            ) {

                setStatus(
                    "Deadline must be in the future."
                );

                setLoading(false);

                return;
            }

            setStatus(
                "Creating milestone..."
            );

            const tx =
                await contract.createMilestone(
                    projectTitle,
                    projectDescription,
                    amountWei,
                    deadlineTimestamp
                );

            setStatus(
                "Waiting for blockchain confirmation..."
            );

            await tx.wait();

            setStatus(
                `Milestone created successfully. Transaction: ${tx.hash}`
            );

            setProjectTitle("");
            setProjectDescription("");
            setAmount("");
            setDeadline("");

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Milestone creation failed."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // FUND ESCROW
    // =================================================

    async function fundEscrow() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "CLIENT") {
            setStatus(
                "Only the client can fund the escrow."
            );
            return;
        }

        if (!milestone) {
            setStatus(
                "Milestone information not available."
            );
            return;
        }

        try {

            setLoading(true);

            const milestoneAmount =
                milestone.amount;

            if (milestoneAmount === 0n) {

                setStatus(
                    "Milestone amount is zero."
                );

                setLoading(false);

                return;
            }

            setStatus(
                `Funding escrow with ${formatEther(
                    milestoneAmount
                )} ETH...`
            );

            const tx =
                await contract.fundEscrow(
                    milestoneId,
                    {
                        value: milestoneAmount
                    }
                );

            setStatus(
                "Waiting for funding confirmation..."
            );

            await tx.wait();

            setStatus(
                `Escrow funded successfully. Transaction: ${tx.hash}`
            );

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Funding failed."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // START WORK
    // =================================================

    async function startWork() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "FREELANCER") {
            setStatus(
                "Only the freelancer can start work."
            );
            return;
        }

        try {

            setLoading(true);

            setStatus(
                "Starting work..."
            );

            const tx =
                await contract.startWork(
                    milestoneId
                );

            await tx.wait();

            setStatus(
                `Work started successfully. Transaction: ${tx.hash}`
            );

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Unable to start work."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // SUBMIT WORK
    // =================================================

    async function submitWork() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "FREELANCER") {
            setStatus(
                "Only the freelancer can submit work."
            );
            return;
        }

        if (!workDescription.trim()) {

            setStatus(
                "Please describe the completed work before submitting."
            );

            return;
        }

        try {

            setLoading(true);

            setStatus(
                "Submitting work to blockchain..."
            );

            /*
             * The work description is stored on-chain
             * through the submitWork function.
             */

            const tx =
                await contract.submitWork(
                    milestoneId,
                    workDescription
                );

            setStatus(
                "Waiting for transaction confirmation..."
            );

            await tx.wait();

            setStatus(
                `Work submitted successfully. Transaction: ${tx.hash}`
            );

            setWorkDescription("");

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Work submission failed."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // APPROVE AND RELEASE
    // =================================================

    async function approveAndRelease() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "CLIENT") {

            setStatus(
                "Only the client can approve payment."
            );

            return;
        }

        try {

            setLoading(true);

            setStatus(
                "Approving work and releasing payment..."
            );

            const tx =
                await contract.approveAndReleasePayment(
                    milestoneId
                );

            await tx.wait();

            setStatus(
                `Payment released successfully. Transaction: ${tx.hash}`
            );

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Payment release failed."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // CANCEL AND REFUND
    // =================================================

    async function cancelAndRefund() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "CLIENT") {

            setStatus(
                "Only the client can cancel and request refund."
            );

            return;
        }

        try {

            setLoading(true);

            setStatus(
                "Processing cancellation and refund..."
            );

            const tx =
                await contract.cancelAndRefund(
                    milestoneId
                );

            await tx.wait();

            setStatus(
                `Refund completed successfully. Transaction: ${tx.hash}`
            );

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Refund failed."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // RAISE DISPUTE
    // =================================================

    async function raiseDispute() {

        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (
            role !== "CLIENT" &&
            role !== "FREELANCER"
        ) {

            setStatus(
                "Only the client or freelancer can raise a dispute."
            );

            return;
        }

        if (!disputeReason.trim()) {

            setStatus(
                "Please enter the dispute reason."
            );

            return;
        }

        try {

            setLoading(true);

            setStatus(
                "Raising dispute..."
            );

            const tx =
                await contract.raiseDispute(
                    milestoneId,
                    disputeReason
                );

            await tx.wait();

            setStatus(
                `Dispute raised successfully. Transaction: ${tx.hash}`
            );

            setDisputeReason("");

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {

            console.error(error);

            setStatus(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Unable to raise dispute."
            );

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // RESOLVE DISPUTE
    // =================================================

    async function resolveDispute() {
        if (!contract) {
            setStatus("Connect MetaMask first.");
            return;
        }

        if (role !== "ARBITRATOR") {
            setStatus("Only the arbitrator can resolve a dispute.");
            return;
        }

        if (!milestone) {
            setStatus("Milestone information is not available.");
            return;
        }

        if (Number(milestone.state) !== 5) {
            setStatus(
                `Milestone is not disputed. Current status: ${getStatusName(
                    milestone.state
                )}`
            );
            return;
        }

        if (
            !disputeFreelancerAmount ||
            Number(disputeFreelancerAmount) < 0
        ) {
            setStatus("Enter a valid freelancer payout amount.");
            return;
        }

        if (
            !disputeClientAmount ||
            Number(disputeClientAmount) < 0
        ) {
            setStatus("Enter a valid client refund amount.");
            return;
        }

        try {
            setLoading(true);

            const freelancerWei = parseEther(
                disputeFreelancerAmount
            );

            const clientWei = parseEther(
                disputeClientAmount
            );

            const totalPayout = freelancerWei + clientWei;
            const escrowAmount = milestone.amount;

            if (totalPayout !== escrowAmount) {
                setStatus(
                    `Payouts must equal escrow amount. Required: ${formatEther(
                        escrowAmount
                    )} ETH`
                );
                return;
            }

            setStatus(
                "Please confirm the dispute resolution in MetaMask..."
            );

            /*
             * FreelanceEscrow.sol ABI:
             *
             * resolveDispute(
             *     uint256 milestoneId,
             *     uint256 freelancerAmount,
             *     uint256 clientAmount
             * )
             *
             * There is NO resolutionNote parameter.
             */
            const tx = await contract.resolveDispute(
                Number(milestoneId),
                freelancerWei,
                clientWei
            );

            setStatus(
                "Transaction submitted. Waiting for confirmation..."
            );

            await tx.wait();

            setStatus(
                `Dispute resolved successfully. Transaction: ${tx.hash}`
            );

            setResolutionNote("");
            setDisputeFreelancerAmount("");
            setDisputeClientAmount("");

            await loadMilestone(
                contract,
                milestoneId
            );

            await loadHistory(
                contract
            );

        } catch (error) {
            console.error(
                "Resolve dispute error:",
                error
            );

            let message =
                error?.reason ||
                error?.shortMessage ||
                error?.message ||
                "Dispute resolution failed.";

            if (
                message.includes(
                    "user rejected"
                ) ||
                message.includes(
                    "ACTION_REJECTED"
                )
            ) {
                message =
                    "Transaction was rejected in MetaMask.";
            }

            setStatus(
                `Resolve dispute failed: ${message}`
            );
        } finally {
            setLoading(false);
        }
    }


    // =================================================
    // CHANGE MILESTONE
    // =================================================

    async function changeMilestone(id) {

        setMilestoneId(
            String(id)
        );

        if (contract) {

            await loadMilestone(
                contract,
                String(id)
            );
        }
    }


    // =================================================
    // AUTO LOAD
    // =================================================

    useEffect(() => {

        if (!window.ethereum) return;

        const handleAccountsChanged =
            async (accounts) => {

                if (accounts.length === 0) {

                    setAccount("");
                    setRole("");

                    return;
                }

                await connectWallet();
            };

        window.ethereum.on(
            "accountsChanged",
            handleAccountsChanged
        );

        return () => {

            if (window.ethereum.removeListener) {

                window.ethereum.removeListener(
                    "accountsChanged",
                    handleAccountsChanged
                );
            }
        };

    }, []);


    // =================================================
    // MILESTONE PROGRESS
    // =================================================

    function getProgress(state) {
        const progress = {
            0: 10,   // CREATED
            1: 25,   // FUNDED
            2: 50,   // IN_PROGRESS
            3: 75,   // SUBMITTED
            4: 100,  // COMPLETED
            5: 75,   // DISPUTED
            6: 100   // REFUNDED
        };

        return progress[Number(state)] ?? 0;
    }

    function formatHistoryDate(timestamp) {
        if (!timestamp) return "Date unavailable";

        return new Date(
            Number(timestamp) * 1000
        ).toLocaleString();
    }

    function shortHash(hash) {
        if (!hash) return "";

        return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    }


    // =================================================
    // RENDER - NOT CONNECTED
    // =================================================

    if (!account) {

        return (

            <div className="app">

                <header className="header">

                    <div className="brand">

                        <div className="brand-icon">
                            $
                        </div>

                        <div>
                            <h2>
                                Freelance Escrow
                            </h2>

                            <span>
                                Blockchain Payment System
                            </span>
                        </div>

                    </div>

                    <button
                        className="connect-button"
                        onClick={connectWallet}
                    >
                        Connect MetaMask
                    </button>

                </header>


                <main className="container">

                    <section className="hero">

                        <h1>
                            Freelance Payment
                            <span> Escrow</span>
                        </h1>

                        <p>
                            Secure blockchain-based payment
                            management for freelance projects.
                        </p>

                    </section>


                    <div className="card welcome-card">

                        <div className="welcome-icon">
                            $
                        </div>

                        <h2>
                            Connect Your Wallet
                        </h2>

                        <p>
                            Connect MetaMask to access your
                            role-specific escrow dashboard.
                        </p>

                        <button
                            className="primary-button"
                            onClick={connectWallet}
                        >
                            Connect MetaMask
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =================================================
    // MAIN DASHBOARD
    // =================================================

    return (

        <div className="app">

            <header className="header">

                <div className="brand">

                    <div className="brand-icon">
                        $
                    </div>

                    <div>

                        <h2>
                            Freelance Escrow
                        </h2>

                        <span>
                            Blockchain Payment System
                        </span>

                    </div>

                </div>

                <div className="role-badge">
                    {role}
                </div>

            </header>


            <main className="container">

                {/* WALLET */}

                <div className="card wallet-card">

                    <div>

                        <span className="section-label">
                            CONNECTED WALLET
                        </span>

                        <div className="wallet-address">
                            {account}
                        </div>

                    </div>

                    <div className="role-badge">
                        {role}
                    </div>

                </div>


                {/* =================================================
                    CLIENT DASHBOARD
                ================================================= */}

                {role === "CLIENT" && (

                    <>

                        <section className="dashboard-heading">

                            <h2>
                                Client Dashboard
                            </h2>

                            <p>
                                Create projects, set milestone
                                amounts, lock funds, approve
                                payments and manage disputes.
                            </p>

                        </section>


                        <div className="two-column">

                            {/* CREATE */}

                            <section className="card">

                                <h3>
                                    Create Milestone
                                </h3>

                                <p className="muted">
                                    Define the project and
                                    payment amount.
                                </p>


                                <label>
                                    Project Title
                                </label>

                                <input
                                    type="text"
                                    value={projectTitle}
                                    onChange={(e) =>
                                        setProjectTitle(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Website Development"
                                />


                                <label>
                                    Project Description
                                </label>

                                <textarea
                                    value={projectDescription}
                                    onChange={(e) =>
                                        setProjectDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the work to be completed..."
                                />


                                <label>
                                    Escrow Amount (ETH)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter amount in ETH"
                                />

                                <small>
                                    Example: 0.01 ETH, 0.1 ETH,
                                    0.5 ETH, 1 ETH
                                </small>


                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) =>
                                        setDeadline(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    className="primary-button full-button"
                                    onClick={
                                        createMilestone
                                    }
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Processing..."
                                        : "Create Milestone"}
                                </button>

                            </section>


                            {/* MANAGEMENT */}

                            <section className="card">

                                <h3>
                                    Escrow Management
                                </h3>

                                <p className="muted">
                                    Manage the selected milestone.
                                </p>


                                <label>
                                    Milestone ID
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={milestoneId}
                                    onChange={(e) =>
                                        changeMilestone(
                                            e.target.value
                                        )
                                    }
                                />


                                {milestone && (

                                    <div className="milestone-info">

                                        <div>

                                            <span>
                                                Amount
                                            </span>

                                            <strong>
                                                {formatEther(
                                                    milestone.amount
                                                )} ETH
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {getStatusName(
                                                    milestone.state
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                )}


                                <div className="button-grid">

                                    <button
                                        className="primary-button"
                                        onClick={fundEscrow}
                                        disabled={
                                            loading ||
                                            !milestone ||
                                            milestone.funded
                                        }
                                    >
                                        Fund Escrow
                                    </button>


                                    <button
                                        className="success-button"
                                        onClick={
                                            approveAndRelease
                                        }
                                        disabled={
                                            loading ||
                                            !milestone ||
                                            milestone.released
                                        }
                                    >
                                        Approve & Release
                                    </button>


                                    <button
                                        className="warning-button"
                                        onClick={
                                            cancelAndRefund
                                        }
                                        disabled={loading}
                                    >
                                        Cancel & Refund
                                    </button>


                                    <button
                                        className="danger-button"
                                        onClick={
                                            raiseDispute
                                        }
                                        disabled={loading}
                                    >
                                        Raise Dispute
                                    </button>

                                </div>


                                <label>
                                    Dispute Reason
                                </label>

                                <textarea
                                    value={disputeReason}
                                    onChange={(e) =>
                                        setDisputeReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Explain the reason for the dispute..."
                                />

                            </section>

                        </div>

                    </>
                )}


                {/* =================================================
                    CLIENT MILESTONE HISTORY
                ================================================= */}

                {role === "CLIENT" && (
                    <section className="card history-card">

                        <div className="card-heading">
                            <h3>Milestone History</h3>

                            <p className="muted">
                                Track every milestone created,
                                its current progress and settlement.
                            </p>
                        </div>

                        <div className="summary-grid">

                            <div className="summary-item">
                                <span>Total Milestones</span>
                                <strong>
                                    {clientTotalCreated}
                                </strong>
                            </div>

                            <div className="summary-item">
                                <span>Completed</span>
                                <strong>
                                    {
                                        milestoneHistory.filter(
                                            (m) =>
                                                m.state === 4
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="summary-item">
                                <span>In Progress</span>
                                <strong>
                                    {
                                        milestoneHistory.filter(
                                            (m) =>
                                                m.state >= 1 &&
                                                m.state < 4 &&
                                                m.state !== 5
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="summary-item">
                                <span>Refunded to Client</span>
                                <strong>
                                    {formatEther(
                                        clientTotalRefunded
                                    )} ETH
                                </strong>
                            </div>

                        </div>

                        {historyLoading ? (
                            <p className="muted">
                                Loading milestone history...
                            </p>
                        ) : milestoneHistory.length === 0 ? (
                            <div className="empty-history">
                                No milestones created yet.
                            </div>
                        ) : (
                            <div className="history-list">

                                {milestoneHistory
                                    .slice()
                                    .reverse()
                                    .map((item) => (

                                    <div
                                        className="history-item"
                                        key={item.id}
                                    >

                                        <div className="history-top">
                                            <div>
                                                <strong>
                                                    #{item.id}{" "}
                                                    {item.title}
                                                </strong>

                                                <span>
                                                    Created{" "}
                                                    {formatHistoryDate(
                                                        item.createdAt
                                                    )}
                                                </span>
                                            </div>

                                            <span className="status-pill">
                                                {
                                                    getStatusName(
                                                        item.state
                                                    )
                                                }
                                            </span>
                                        </div>

                                        <div className="progress-track">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${getProgress(
                                                        item.state
                                                    )}%`
                                                }}
                                            />
                                        </div>

                                        <div className="history-meta">

                                            <span>
                                                Amount:{" "}
                                                <strong>
                                                    {formatEther(
                                                        item.amount
                                                    )} ETH
                                                </strong>
                                            </span>

                                            <span>
                                                Progress:{" "}
                                                <strong>
                                                    {getProgress(
                                                        item.state
                                                    )}%
                                                </strong>
                                            </span>

                                            <span>
                                                Deadline:{" "}
                                                <strong>
                                                    {formatHistoryDate(
                                                        item.deadline
                                                    )}
                                                </strong>
                                            </span>

                                        </div>

                                        {item.submissionURI && (
                                            <div className="submission-history">
                                                <span>
                                                    Work submitted:
                                                </span>

                                                <strong>
                                                    {item.submissionURI}
                                                </strong>
                                            </div>
                                        )}

                                    </div>
                                ))}

                            </div>
                        )}

                    </section>
                )}


                {/* =================================================
                    FREELANCER DASHBOARD
                ================================================= */}

                {role === "FREELANCER" && (

                    <>

                        <section className="dashboard-heading">

                            <h2>
                                Freelancer Dashboard
                            </h2>

                            <p>
                                View your assigned escrow,
                                start work and submit completed
                                work through the blockchain.
                            </p>

                        </section>


                        <div className="two-column">

                            {/* ASSIGNED ESCROW */}

                            <section className="card">

                                <h3>
                                    Assigned Escrow
                                </h3>

                                <p className="muted">
                                    Project participant information.
                                </p>


                                <div className="detail">

                                    <span>
                                        Client
                                    </span>

                                    <strong>
                                        {client.slice(0, 6)}
                                        ...
                                        {client.slice(-4)}
                                    </strong>

                                </div>


                                <div className="detail">

                                    <span>
                                        Freelancer
                                    </span>

                                    <strong>
                                        {freelancer.slice(0, 6)}
                                        ...
                                        {freelancer.slice(-4)}
                                    </strong>

                                </div>


                                <div className="detail">

                                    <span>
                                        Milestone
                                    </span>

                                    <strong>
                                        #{milestoneId}
                                    </strong>

                                </div>


                                {milestone && (

                                    <div className="milestone-info">

                                        <div>

                                            <span>
                                                Amount
                                            </span>

                                            <strong>
                                                {formatEther(
                                                    milestone.amount
                                                )} ETH
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {getStatusName(
                                                    milestone.state
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </section>


                            {/* WORK MANAGEMENT */}

                            <section className="card">

                                <h3>
                                    Work Management
                                </h3>

                                <p className="muted">
                                    Update project progress
                                    on-chain.
                                </p>


                                <label>
                                    Milestone ID
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={milestoneId}
                                    onChange={(e) =>
                                        changeMilestone(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    className="primary-button full-button"
                                    onClick={startWork}
                                    disabled={loading}
                                >
                                    Start Work
                                </button>


                                <label>
                                    Completed Work / Proof
                                </label>

                                <textarea
                                    value={workDescription}
                                    onChange={(e) =>
                                        setWorkDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the completed work or provide a proof/reference..."
                                />


                                <button
                                    className="success-button full-button"
                                    onClick={submitWork}
                                    disabled={
                                        loading ||
                                        !workDescription.trim()
                                    }
                                >
                                    Submit Work
                                </button>


                                <button
                                    className="danger-button full-button"
                                    onClick={raiseDispute}
                                    disabled={loading}
                                >
                                    Raise Dispute
                                </button>


                                <label>
                                    Dispute Reason
                                </label>

                                <textarea
                                    value={disputeReason}
                                    onChange={(e) =>
                                        setDisputeReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Explain why you are raising the dispute..."
                                />

                            </section>

                        </div>

                    </>
                )}


                {/* =================================================
                    ARBITRATOR DASHBOARD
                ================================================= */}

                {role === "ARBITRATOR" && (

                    <>

                        <section className="dashboard-heading">

                            <h2>
                                Arbitrator Dashboard
                            </h2>

                            <p>
                                Review disputed milestones
                                and decide how the escrow
                                funds should be distributed.
                            </p>

                        </section>


                        <div className="two-column">

                            <section className="card">

                                <h3>
                                    Dispute Information
                                </h3>

                                <p className="muted">
                                    Review the current milestone.
                                </p>


                                <label>
                                    Milestone ID
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={milestoneId}
                                    onChange={(e) =>
                                        changeMilestone(
                                            e.target.value
                                        )
                                    }
                                />


                                {milestone && (

                                    <div className="milestone-info">

                                        <div>

                                            <span>
                                                Escrow Amount
                                            </span>

                                            <strong>
                                                {formatEther(
                                                    milestone.amount
                                                )} ETH
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {getStatusName(
                                                    milestone.state
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </section>


                            <section className="card">

                                <h3>
                                    Resolve Dispute
                                </h3>

                                <p className="muted">
                                    The two payout amounts must
                                    equal the total escrow amount.
                                </p>


                                <label>
                                    Freelancer Amount (ETH)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={
                                        disputeFreelancerAmount
                                    }
                                    onChange={(e) =>
                                        setDisputeFreelancerAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: 0.006"
                                />


                                <label>
                                    Client Refund (ETH)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={
                                        disputeClientAmount
                                    }
                                    onChange={(e) =>
                                        setDisputeClientAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: 0.004"
                                />


                                <label>
                                    Resolution Note
                                </label>

                                <textarea
                                    value={
                                        resolutionNote
                                    }
                                    onChange={(e) =>
                                        setResolutionNote(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Explain the arbitration decision..."
                                />


                                <button
                                    className="primary-button full-button"
                                    onClick={
                                        resolveDispute
                                    }
                                    disabled={loading}
                                >
                                    Resolve Dispute
                                </button>

                            </section>

                        </div>

                    </>
                )}


                {/* =================================================
                    FREELANCER EARNINGS & HISTORY
                ================================================= */}

                {role === "FREELANCER" && (
                    <section className="card history-card">

                        <div className="card-heading">
                            <h3>Earnings & Payment History</h3>

                            <p className="muted">
                                Track your completed work and
                                blockchain payouts.
                            </p>
                        </div>

                        <div className="earnings-banner">

                            <div>
                                <span>
                                    TOTAL EARNED
                                </span>

                                <strong>
                                    {formatEther(
                                        freelancerTotalEarned
                                    )} ETH
                                </strong>
                            </div>

                            <div>
                                <span>
                                    COMPLETED MILESTONES
                                </span>

                                <strong>
                                    {freelancerCompletedCount}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    PAYOUT RECORDS
                                </span>

                                <strong>
                                    {paymentHistory.filter(
                                        (item) =>
                                            item.freelancerAmount >
                                            0n
                                    ).length}
                                </strong>
                            </div>

                        </div>

                        {historyLoading ? (
                            <p className="muted">
                                Loading payment history...
                            </p>
                        ) : (
                            <div className="history-list">

                                {paymentHistory.filter(
                                    (item) =>
                                        item.freelancerAmount >
                                        0n
                                ).length === 0 ? (

                                    <div className="empty-history">
                                        No freelancer earnings yet.
                                    </div>

                                ) : (

                                    paymentHistory
                                        .filter(
                                            (item) =>
                                                item.freelancerAmount >
                                                0n
                                        )
                                        .map((item, index) => (

                                            <div
                                                className="history-item earning-item"
                                                key={`${item.transactionHash}-${index}`}
                                            >

                                                <div className="history-top">

                                                    <div>
                                                        <strong>
                                                            Milestone #
                                                            {
                                                                item.milestoneId
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.type ===
                                                                "DISPUTE_RESOLVED"
                                                                    ? "Arbitrator dispute payout"
                                                                    : "Client approved payment"
                                                            }
                                                        </span>
                                                    </div>

                                                    <span className="earning-amount">
                                                        +
                                                        {formatEther(
                                                            item.freelancerAmount
                                                        )}{" "}
                                                        ETH
                                                    </span>

                                                </div>

                                                <div className="history-meta">

                                                    <span>
                                                        Date:{" "}
                                                        <strong>
                                                            {formatHistoryDate(
                                                                item.timestamp
                                                            )}
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Transaction:{" "}
                                                        <strong>
                                                            {shortHash(
                                                                item.transactionHash
                                                            )}
                                                        </strong>
                                                    </span>

                                                </div>

                                                {item.type ===
                                                    "DISPUTE_RESOLVED" && (
                                                    <div className="payout-detail">
                                                        Dispute resolved:
                                                        freelancer received{" "}
                                                        <strong>
                                                            {formatEther(
                                                                item.freelancerAmount
                                                            )} ETH
                                                        </strong>
                                                        {" "}and client received{" "}
                                                        <strong>
                                                            {formatEther(
                                                                item.clientAmount
                                                            )} ETH
                                                        </strong>.
                                                    </div>
                                                )}

                                            </div>
                                        ))
                                )}

                            </div>
                        )}

                    </section>
                )}


                {/* =================================================
                    CONTRACT INFORMATION
                ================================================= */}

                <section className="card contract-card">

                    <div className="card-heading">

                        <h3>
                            Contract Information
                        </h3>

                        <p className="muted">
                            Current blockchain participants.
                        </p>

                    </div>


                    <div className="info-grid">

                        <div className="info-item">

                            <span>
                                Client
                            </span>

                            <strong>
                                {client
                                    ? `${client.slice(0, 6)}...${client.slice(-4)}`
                                    : "-"}
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>
                                Freelancer
                            </span>

                            <strong>
                                {freelancer
                                    ? `${freelancer.slice(0, 6)}...${freelancer.slice(-4)}`
                                    : "-"}
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>
                                Arbitrator
                            </span>

                            <strong>
                                {arbitrator
                                    ? `${arbitrator.slice(0, 6)}...${arbitrator.slice(-4)}`
                                    : "-"}
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>
                                Milestone
                            </span>

                            <strong>
                                #{milestoneId}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TRANSACTION STATUS
                ================================================= */}

                <section className="status-card">

                    <span>
                        TRANSACTION STATUS
                    </span>

                    <p>
                        {status ||
                            "Ready for blockchain interaction."}
                    </p>

                </section>

            </main>


            <footer className="footer">

                <strong>
                    Smart Contract-Based Freelance
                    Payment Escrow System
                </strong>

                <span>
                    Educational Blockchain Project
                </span>

            </footer>

        </div>
    );
}

export default App;