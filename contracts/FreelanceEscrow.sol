// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceEscrow is ReentrancyGuard {

    enum MilestoneState {
        CREATED,
        FUNDED,
        IN_PROGRESS,
        SUBMITTED,
        COMPLETED,
        DISPUTED,
        REFUNDED,
        CANCELLED
    }

    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneState state;
        string submissionURI;
        uint256 createdAt;
    }

    address payable public client;
    address payable public freelancer;
    address public arbitrator;

    uint256 public milestoneCount;

    mapping(uint256 => Milestone) public milestones;

    event EscrowCreated(
        address indexed client,
        address indexed freelancer,
        address indexed arbitrator
    );

    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 amount,
        uint256 deadline
    );

    event FundsDeposited(
        uint256 indexed milestoneId,
        uint256 amount
    );

    event WorkStarted(
        uint256 indexed milestoneId
    );

    event WorkSubmitted(
        uint256 indexed milestoneId,
        string submissionURI
    );

    event PaymentReleased(
        uint256 indexed milestoneId,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed milestoneId,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed milestoneId,
        address indexed raisedBy,
        string reason
    );

    event DisputeResolved(
        uint256 indexed milestoneId,
        uint256 freelancerAmount,
        uint256 clientAmount
    );

    event MilestoneCancelled(
        uint256 indexed milestoneId
    );

    modifier onlyClient() {
        require(
            msg.sender == client,
            "Only client"
        );
        _;
    }

    modifier onlyFreelancer() {
        require(
            msg.sender == freelancer,
            "Only freelancer"
        );
        _;
    }

    modifier onlyArbitrator() {
        require(
            msg.sender == arbitrator,
            "Only arbitrator"
        );
        _;
    }

    modifier validMilestone(uint256 milestoneId) {
        require(
            milestoneId < milestoneCount,
            "Invalid milestone"
        );
        _;
    }

    constructor(
        address payable _freelancer,
        address _arbitrator
    ) {

        require(
            _freelancer != address(0),
            "Invalid freelancer"
        );

        require(
            _arbitrator != address(0),
            "Invalid arbitrator"
        );

        client = payable(msg.sender);

        freelancer = _freelancer;

        arbitrator = _arbitrator;

        emit EscrowCreated(
            client,
            freelancer,
            arbitrator
        );
    }

    // ================================
    // CREATE MILESTONE
    // ================================

    function createMilestone(
        string calldata title,
        string calldata description,
        uint256 amount,
        uint256 deadline
    )
        external
        onlyClient
    {
        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        require(
            deadline > block.timestamp,
            "Deadline must be in future"
        );

        uint256 milestoneId =
            milestoneCount;

        milestones[milestoneId] =
            Milestone({
                id: milestoneId,
                title: title,
                description: description,
                amount: amount,
                deadline: deadline,
                state: MilestoneState.CREATED,
                submissionURI: "",
                createdAt: block.timestamp
            });

        milestoneCount++;

        emit MilestoneCreated(
            milestoneId,
            amount,
            deadline
        );
    }

    // ================================
    // FUND MILESTONE
    // ================================

    function fundEscrow(
        uint256 milestoneId
    )
        external
        payable
        onlyClient
        validMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.CREATED,
            "Milestone not fundable"
        );

        require(
            msg.value == milestone.amount,
            "Incorrect ETH amount"
        );

        milestone.state =
            MilestoneState.FUNDED;

        emit FundsDeposited(
            milestoneId,
            msg.value
        );
    }

    // ================================
    // START WORK
    // ================================

    function startWork(
        uint256 milestoneId
    )
        external
        onlyFreelancer
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.FUNDED,
            "Milestone not funded"
        );

        milestone.state =
            MilestoneState.IN_PROGRESS;

        emit WorkStarted(
            milestoneId
        );
    }

    // ================================
    // SUBMIT WORK
    // ================================

    function submitWork(
        uint256 milestoneId,
        string calldata submissionURI
    )
        external
        onlyFreelancer
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.IN_PROGRESS,
            "Work not in progress"
        );

        require(
            bytes(submissionURI).length > 0,
            "Submission required"
        );

        milestone.submissionURI =
            submissionURI;

        milestone.state =
            MilestoneState.SUBMITTED;

        emit WorkSubmitted(
            milestoneId,
            submissionURI
        );
    }

    // ================================
    // APPROVE PAYMENT
    // ================================

    function approveAndReleasePayment(
        uint256 milestoneId
    )
        external
        onlyClient
        validMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.SUBMITTED,
            "Work not submitted"
        );

        uint256 amount =
            milestone.amount;

        milestone.state =
            MilestoneState.COMPLETED;

        (
            bool success,
        ) = freelancer.call{
            value: amount
        }("");

        require(
            success,
            "Payment failed"
        );

        emit PaymentReleased(
            milestoneId,
            amount
        );
    }

    // ================================
    // CANCEL BEFORE FUNDING
    // ================================

    function cancelMilestone(
        uint256 milestoneId
    )
        external
        onlyClient
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.CREATED,
            "Cannot cancel now"
        );

        milestone.state =
            MilestoneState.CANCELLED;

        emit MilestoneCancelled(
            milestoneId
        );
    }

    // ================================
    // REFUND
    // ================================

    function cancelAndRefund(
        uint256 milestoneId
    )
        external
        onlyClient
        validMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.FUNDED ||
            milestone.state ==
                MilestoneState.IN_PROGRESS,
            "Not refundable"
        );

        require(
            block.timestamp >
                milestone.deadline,
            "Deadline not reached"
        );

        uint256 amount =
            milestone.amount;

        milestone.state =
            MilestoneState.REFUNDED;

        (
            bool success,
        ) = client.call{
            value: amount
        }("");

        require(
            success,
            "Refund failed"
        );

        emit RefundIssued(
            milestoneId,
            amount
        );
    }

    // ================================
    // RAISE DISPUTE
    // ================================

    function raiseDispute(
        uint256 milestoneId,
        string calldata reason
    )
        external
        validMilestone(milestoneId)
    {
        require(
            msg.sender == client ||
            msg.sender == freelancer,
            "Only project parties"
        );

        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.FUNDED ||
            milestone.state ==
                MilestoneState.IN_PROGRESS ||
            milestone.state ==
                MilestoneState.SUBMITTED,
            "Cannot dispute"
        );

        milestone.state =
            MilestoneState.DISPUTED;

        emit DisputeRaised(
            milestoneId,
            msg.sender,
            reason
        );
    }

    // ================================
    // RESOLVE DISPUTE
    // ================================

    function resolveDispute(
        uint256 milestoneId,
        uint256 freelancerAmount,
        uint256 clientAmount
    )
        external
        onlyArbitrator
        validMilestone(milestoneId)
        nonReentrant
    {
        Milestone storage milestone =
            milestones[milestoneId];

        require(
            milestone.state ==
                MilestoneState.DISPUTED,
            "No active dispute"
        );

        require(
            freelancerAmount +
            clientAmount ==
            milestone.amount,
            "Amounts must equal milestone"
        );

        milestone.state =
            MilestoneState.COMPLETED;

        if (freelancerAmount > 0) {

            (
                bool freelancerSuccess,
            ) = freelancer.call{
                value: freelancerAmount
            }("");

            require(
                freelancerSuccess,
                "Freelancer payment failed"
            );
        }

        if (clientAmount > 0) {

            (
                bool clientSuccess,
            ) = client.call{
                value: clientAmount
            }("");

            require(
                clientSuccess,
                "Client refund failed"
            );
        }

        emit DisputeResolved(
            milestoneId,
            freelancerAmount,
            clientAmount
        );
    }

    // ================================
    // GET MILESTONE
    // ================================

    function getMilestone(
        uint256 milestoneId
    )
        external
        view
        validMilestone(milestoneId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 amount,
            uint256 deadline,
            MilestoneState state,
            string memory submissionURI,
            uint256 createdAt
        )
    {
        Milestone memory milestone =
            milestones[milestoneId];

        return (
            milestone.id,
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.state,
            milestone.submissionURI,
            milestone.createdAt
        );
    }

    // ================================
    // CONTRACT BALANCE
    // ================================

    function getEscrowBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    receive() external payable {
        revert("Use fundEscrow");
    }

    fallback() external payable {
        revert("Invalid function");
    }
}