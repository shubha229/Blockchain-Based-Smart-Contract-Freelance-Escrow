const hre = require("hardhat");

async function main() {

    console.log("=================================");
    console.log("FREELANCE ESCROW DEPLOYMENT");
    console.log("=================================");

    const [client, freelancer, arbitrator] =
        await hre.ethers.getSigners();

    console.log("");
    console.log("CLIENT");
    console.log(client.address);

    console.log("");
    console.log("FREELANCER");
    console.log(freelancer.address);

    console.log("");
    console.log("ARBITRATOR");
    console.log(arbitrator.address);

    console.log("");
    console.log("Deploying FreelanceEscrow...");

    const FreelanceEscrow =
        await hre.ethers.getContractFactory(
            "FreelanceEscrow"
        );

    // IMPORTANT:
    // Your Solidity constructor accepts only:
    // freelancer
    // arbitrator
    //
    // Client is automatically msg.sender.

    const escrow =
        await FreelanceEscrow.deploy(
            freelancer.address,
            arbitrator.address
        );

    await escrow.waitForDeployment();

    const contractAddress =
        await escrow.getAddress();

    console.log("");
    console.log("=================================");
    console.log("DEPLOYMENT SUCCESSFUL");
    console.log("=================================");

    console.log("");
    console.log("CONTRACT ADDRESS");
    console.log(contractAddress);

    console.log("");
    console.log("CLIENT");
    console.log(client.address);

    console.log("");
    console.log("FREELANCER");
    console.log(freelancer.address);

    console.log("");
    console.log("ARBITRATOR");
    console.log(arbitrator.address);

    console.log("");
    console.log("=================================");
    console.log("READY FOR FRONTEND");
    console.log("=================================");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {

        console.error(error);

        process.exit(1);

    });