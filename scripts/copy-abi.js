const fs = require("fs");
const path = require("path");

const source = path.join(
    __dirname,
    "../artifacts/contracts/FreelanceEscrow.sol/FreelanceEscrow.json"
);

const destinationDir = path.join(
    __dirname,
    "../frontend/src/abi"
);

const destination = path.join(
    destinationDir,
    "FreelanceEscrow.json"
);

if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, {
        recursive: true
    });
}

fs.copyFileSync(
    source,
    destination
);

console.log(
    "FreelanceEscrow ABI copied successfully."
);