const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceEscrow", function () {

    async function deployEscrow() {

        const [
            client,
            freelancer,
            arbitrator,
            attacker
        ] = await ethers.getSigners();

        const Escrow =
            await ethers.getContractFactory(
                "FreelanceEscrow"
            );

        const escrow =
            await Escrow.deploy(
                freelancer.address,
                arbitrator.address
            );

        await escrow.waitForDeployment();

        return {
            escrow,
            client,
            freelancer,
            arbitrator,
            attacker
        };
    }


    async function createMilestone(
        escrow,
        client
    ) {

        const amount =
            1000000000000000n;

        const block =
            await ethers.provider.getBlock(
                "latest"
            );

        const deadline =
            block.timestamp + 86400;

        await escrow
            .connect(client)
            .createMilestone(
                "Website Design",
                "Create responsive website",
                amount,
                deadline
            );

        return amount;
    }


    // =====================================
    // TEST 1
    // =====================================

    it("should deploy with correct roles", async function () {

        const {
            escrow,
            client,
            freelancer,
            arbitrator
        } = await deployEscrow();

        expect(
            await escrow.client()
        ).to.equal(
            client.address
        );

        expect(
            await escrow.freelancer()
        ).to.equal(
            freelancer.address
        );

        expect(
            await escrow.arbitrator()
        ).to.equal(
            arbitrator.address
        );
    });


    // =====================================
    // TEST 2
    // =====================================

    it("should create a milestone", async function () {

        const {
            escrow,
            client
        } = await deployEscrow();

        await createMilestone(
            escrow,
            client
        );

        expect(
            await escrow.milestoneCount()
        ).to.equal(1);
    });


    // =====================================
    // TEST 3
    // =====================================

    it("should fund milestone", async function () {

        const {
            escrow,
            client
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        expect(
            await escrow.getEscrowBalance()
        ).to.equal(amount);
    });


    // =====================================
    // TEST 4
    // =====================================

    it("should reject incorrect funding amount", async function () {

        const {
            escrow,
            client
        } = await deployEscrow();

        await createMilestone(
            escrow,
            client
        );

        await expect(
            escrow
                .connect(client)
                .fundEscrow(
                    0,
                    {
                        value:
                            500000000000000n
                    }
                )
        ).to.be.revertedWith(
            "Incorrect ETH amount"
        );
    });


    // =====================================
    // TEST 5
    // =====================================

    it("should allow freelancer to start work", async function () {

        const {
            escrow,
            client,
            freelancer
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(freelancer)
            .startWork(0);

        const milestone =
            await escrow.getMilestone(0);

        expect(
            milestone[5]
        ).to.equal(2);
    });


    // =====================================
    // TEST 6
    // =====================================

    it("should reject unauthorized startWork", async function () {

        const {
            escrow,
            client,
            attacker
        } = await deployEscrow();

        await createMilestone(
            escrow,
            client
        );

        await expect(
            escrow
                .connect(attacker)
                .startWork(0)
        ).to.be.revertedWith(
            "Only freelancer"
        );
    });


    // =====================================
    // TEST 7
    // =====================================

    it("should allow freelancer to submit work", async function () {

        const {
            escrow,
            client,
            freelancer
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(freelancer)
            .startWork(0);

        await escrow
            .connect(freelancer)
            .submitWork(
                0,
                "github.com/project"
            );

        const milestone =
            await escrow.getMilestone(0);

        expect(
            milestone[5]
        ).to.equal(3);
    });


    // =====================================
    // TEST 8
    // =====================================

    it("should release payment", async function () {

        const {
            escrow,
            client,
            freelancer
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(freelancer)
            .startWork(0);

        await escrow
            .connect(freelancer)
            .submitWork(
                0,
                "github.com/project"
            );

        const before =
            await ethers.provider.getBalance(
                freelancer.address
            );

        await escrow
            .connect(client)
            .approveAndReleasePayment(0);

        const after =
            await ethers.provider.getBalance(
                freelancer.address
            );

        expect(
            after - before
        ).to.equal(amount);

        expect(
            await escrow.getEscrowBalance()
        ).to.equal(0);
    });


    // =====================================
    // TEST 9
    // =====================================

    it("should prevent double payment", async function () {

        const {
            escrow,
            client,
            freelancer
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(freelancer)
            .startWork(0);

        await escrow
            .connect(freelancer)
            .submitWork(
                0,
                "github.com/project"
            );

        await escrow
            .connect(client)
            .approveAndReleasePayment(0);

        await expect(
            escrow
                .connect(client)
                .approveAndReleasePayment(0)
        ).to.be.revertedWith(
            "Work not submitted"
        );
    });


    // =====================================
    // TEST 10
    // =====================================

    it("should allow a dispute", async function () {

        const {
            escrow,
            client
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(client)
            .raiseDispute(
                0,
                "Payment dispute"
            );

        const milestone =
            await escrow.getMilestone(0);

        expect(
            milestone[5]
        ).to.equal(5);
    });


    // =====================================
    // TEST 11
    // =====================================

    it("should allow arbitrator to resolve dispute", async function () {

        const {
            escrow,
            client,
            arbitrator
        } = await deployEscrow();

        const amount =
            await createMilestone(
                escrow,
                client
            );

        await escrow
            .connect(client)
            .fundEscrow(
                0,
                {
                    value: amount
                }
            );

        await escrow
            .connect(client)
            .raiseDispute(
                0,
                "Work disagreement"
            );

        const freelancerAmount =
            600000000000000n;

        const clientAmount =
            400000000000000n;

        await escrow
            .connect(arbitrator)
            .resolveDispute(
                0,
                freelancerAmount,
                clientAmount
            );

        const milestone =
            await escrow.getMilestone(0);

        expect(
            milestone[5]
        ).to.equal(4);

        expect(
            await escrow.getEscrowBalance()
        ).to.equal(0);
    });

});