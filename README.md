# 💼 Blockchain-Based Freelance Payment Escrow DApp

> **A decentralized escrow platform for secure, milestone-based freelance payments using blockchain smart contracts.**

---

## 📖 Description

Freelance projects require trust between clients and freelancers. Clients want assurance that their funds are protected until the agreed work is completed, while freelancers want confidence that they will receive payment after delivering the work.

Traditional freelance platforms rely on centralized intermediaries to hold funds and resolve disputes.

This project demonstrates a **blockchain-based freelance escrow system** where a Solidity smart contract manages milestone payments according to predefined rules.

### 💡 Core Idea

The platform connects:

| Participant | Responsibility |
|---|---|
| 👤 **Client** | Creates milestones, funds escrow, approves payments, requests refunds, and raises disputes |
| 👨‍💻 **Freelancer** | Starts work, submits work, receives payments, and raises disputes |
| ⚖️ **Arbitrator** | Reviews disputes and distributes escrow funds |
| ⛓️ **Smart Contract** | Locks, releases, refunds, and settles funds according to contract rules |

---

## 🎯 Problem Statement

Freelance payment workflows can involve:

- Lack of trust between clients and freelancers
- Payment delays
- Centralized escrow systems
- Manual dispute resolution
- Platform dependency
- Limited transparency
- Difficulty tracking milestone-based payments

### 💡 Solution

This project uses a **programmable smart-contract escrow mechanism** to control funds and ensure that payment operations follow predefined conditions.

---

## ✨ Key Features

### 👤 Client

- 🔐 MetaMask wallet connection
- 📝 Create freelance milestones
- 💰 Set custom ETH amounts
- 📅 Set milestone deadlines
- 🔒 Fund escrow
- 📊 Track milestone progress
- 👀 Review submitted work
- ✅ Approve and release payments
- ↩️ Request eligible refunds
- ⚖️ Raise disputes
- 📜 View milestone history
- 💸 Track project payments

### 👨‍💻 Freelancer

- 🔐 MetaMask wallet connection
- 📋 View assigned milestones
- ▶️ Start assigned work
- 📤 Submit completed work/proof
- 📊 Track milestone progress
- ⚖️ Raise disputes
- 💰 Receive milestone payments
- 💵 Track total ETH earned
- 📜 View payment history
- ⚖️ View dispute payouts

### ⚖️ Arbitrator

- 🔐 Connect using the arbitrator wallet
- ⚖️ Review disputed milestones
- 📋 View escrow information
- 💰 Set freelancer payout
- ↩️ Set client refund
- 📝 Provide resolution information
- ✅ Resolve disputes
- 💸 Distribute escrow funds

### ⛓️ Blockchain

- Smart contract-based escrow
- Role-based access control
- Milestone-based payments
- Custom ETH amounts
- ETH fund locking
- Payment release
- Refund mechanism
- Dispute resolution
- Smart contract events
- Transaction tracking
- Local blockchain development
- Automated Hardhat testing

---

## 🔄 How the Escrow Works

### Normal Payment Flow

| Step | Action |
|---:|---|
| **1** | Client creates a milestone |
| **2** | Client sets the ETH amount and deadline |
| **3** | Client funds the escrow |
| **4** | Smart contract locks the ETH |
| **5** | Freelancer starts the work |
| **6** | Freelancer submits the completed work |
| **7** | Client reviews the submission |
| **8** | Client approves the milestone |
| **9** | Smart contract releases the payment |
| **10** | Freelancer receives the ETH |

### ⚖️ Dispute Flow

| Step | Action |
|---:|---|
| **1** | Client or freelancer raises a dispute |
| **2** | Milestone enters the disputed state |
| **3** | Arbitrator reviews the escrow |
| **4** | Arbitrator decides the payout |
| **5** | Smart contract distributes the funds |
| **6** | Freelancer receives the assigned payout |
| **7** | Client receives the assigned refund |

### ↩️ Refund Flow

| Step | Action |
|---:|---|
| **1** | Milestone becomes eligible for refund |
| **2** | Client requests the refund |
| **3** | Smart contract validates the request |
| **4** | Escrow funds are returned to the client |
| **5** | Milestone becomes `REFUNDED` |

---

## 📊 Milestone States

| State | Meaning |
|---|---|
| `CREATED` | Milestone has been created |
| `FUNDED` | Client has deposited funds |
| `IN_PROGRESS` | Freelancer has started work |
| `SUBMITTED` | Freelancer has submitted work |
| `COMPLETED` | Payment has been released |
| `DISPUTED` | A dispute has been raised |
| `REFUNDED` | Funds have been returned to the client |

---

### Architecture Responsibilities

| Layer | Technology | Purpose |
|---|---|---|
| 🎨 Frontend | React + CSS + Vite | User interface and dashboards |
| 🔗 Web3 Layer | Ethers.js | Frontend-to-blockchain communication |
| 🦊 Wallet | MetaMask | Wallet connection and transaction signing |
| 📜 Smart Contract | Solidity | Escrow, payments, refunds, and disputes |
| 🧪 Development | Hardhat | Compilation, local blockchain, deployment, and testing |
| ⛓️ Network | Ethereum-compatible blockchain | Smart contract execution |

---

## 👥 Role-Based Access

### 👤 Client Dashboard

- Create Milestone
- Fund Escrow
- Approve Payment
- Request Refund
- Raise Dispute
- View History
- Track Milestones

### 👨‍💻 Freelancer Dashboard

- View Milestones
- Start Work
- Submit Work
- Raise Dispute
- View Earnings
- View Payment History

### ⚖️ Arbitrator Dashboard

- View Disputes
- Review Escrow
- Set Payout
- Resolve Dispute

---

## 💰 Custom Milestone Amounts

Milestone amounts are **not fixed**.

The client can enter a custom ETH amount while creating each milestone.

| Milestone | Example Amount |
|---|---:|
| Milestone 1 | `0.001 ETH` |
| Milestone 2 | `0.005 ETH` |
| Milestone 3 | `0.010 ETH` |
| Milestone 4 | `0.025 ETH` |

The selected amount is supplied to the smart contract during the funding transaction.

---

## ⚖️ Dispute Resolution Example

For an escrow containing `0.010 ETH`:

| Settlement | Amount |
|---|---:|
| Freelancer Payout | `0.006 ETH` |
| Client Refund | `0.004 ETH` |
| **Total Settlement** | **`0.010 ETH`** |

The arbitrator's transaction performs the settlement on-chain.

---

## 📜 Transaction History

The frontend displays important project activity, including:

- Milestone creation
- Escrow funding
- Work submission
- Payment release
- Refunds
- Disputes
- Dispute resolution

This gives users visibility into blockchain activity associated with the project.

---

## 💵 Freelancer Earnings

The freelancer dashboard tracks completed payments and earnings.

**Example:**

| Metric | Value |
|---|---:|
| Total ETH Earned | `0.016 ETH` |
| Completed Milestones | `3` |

### Payment History

| Milestone | Payment |
|---|---:|
| Milestone #1 | `0.006 ETH` |
| Milestone #2 | `0.004 ETH` |
| Milestone #3 | `0.006 ETH` |

---

## 📊 Client Milestone Tracking

The client dashboard can track:

- Total Milestones
- Completed
- In Progress
- Submitted
- Disputed
- Refunded

Each milestone can display:

- Milestone ID
- Amount
- Status
- Deadline
- Progress
- Work submission
- Payment status

---

## 📁 Project Structure

```text
Blockchain-Based-Smart-Contract-Freelance-Escrow/
│
├── contracts/
│   └── FreelanceEscrow.sol
│
├── scripts/
│   ├── copy-abi.js
│   └── deploy.js
│
├── test/
│   └── FreelanceEscrow.test.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── abi/
│   │   │   └── FreelanceEscrow.json
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
├── artifacts/
├── cache/
│
├── hardhat.config.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies Used

| Category | Technology | Purpose |
|---|---|---|
| Blockchain | Solidity | Smart contract development |
| Blockchain | Ethereum-compatible blockchain | Blockchain execution |
| Development | Hardhat | Development and testing |
| Web3 | Ethers.js | Blockchain interaction |
| Frontend | React.js | User interface |
| Frontend | JavaScript | Application logic |
| Frontend | CSS | UI styling |
| Frontend | Vite | Development server |
| Wallet | MetaMask | Wallet and transactions |
| Tools | Node.js | JavaScript runtime |
| Tools | npm | Package management |
| Tools | Git | Version control |
| Tools | GitHub | Repository hosting |
| Tools | Remix IDE | Smart contract development |

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shubha229/Blockchain-Based-Smart-Contract-Freelance-Escrow
cd Blockchain-Based-Smart-Contract-Freelance-Escrow
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the Project

The project requires:

1. Hardhat local blockchain
2. Smart contract deployment
3. React frontend

### Step 1 — Start Hardhat

From the project root:

```bash
npx hardhat node
```

Keep this terminal running.

Hardhat will provide local development accounts containing test ETH.

### Step 2 — Compile the Contract

Open another terminal:

```bash
npx hardhat compile
```

Expected result:

```text
Compiled successfully
```

### Step 3 — Run Tests

```bash
npx hardhat test
```

The test suite covers:

- Payment release
- Double-payment prevention
- Dispute handling
- Arbitrator resolution
- Access control
- Refund workflow

Example:

```text
11 passing
```

### Step 4 — Deploy the Contract

With the Hardhat node running:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Example deployment output:

```text
=================================
FREELANCE ESCROW DEPLOYMENT
=================================

CLIENT
0x...

FREELANCER
0x...

ARBITRATOR
0x...

Deploying FreelanceEscrow...

Escrow Contract
0x...
```

### Step 5 — Copy the Contract ABI

```bash
node scripts/copy-abi.js
```

The ABI is copied to:

```text
frontend/src/abi/FreelanceEscrow.json
```

### Step 6 — Start the Frontend

```bash
cd frontend
npm run dev
```

Open the Vite URL, normally:

```text
http://localhost:5173
```

---

## 🦊 MetaMask Configuration

For local development:

1. Install MetaMask.
2. Connect MetaMask to the local Hardhat blockchain.
3. Import the required Hardhat test accounts.
4. Open the React application.
5. Connect the desired wallet.
6. The application detects the connected role.

### Development Roles

| Role | Wallet |
|---|---|
| 👤 Client | Hardhat Account |
| 👨‍💻 Freelancer | Hardhat Account |
| ⚖️ Arbitrator | Hardhat Account |

> ⚠️ **Never upload real private keys or seed phrases to GitHub.**

---

## 🧪 Testing

Run the complete test suite:

```bash
npx hardhat test
```

### Covered Functionality

- ✅ Payment release
- ✅ Double-payment prevention
- ✅ Dispute creation
- ✅ Arbitrator dispute resolution
- ✅ Role-based access control
- ✅ Refund workflow

---

## 📌 Smart Contract Functions

### 👤 Client Operations

```text
createMilestone()
fundEscrow()
approveAndReleasePayment()
cancelAndRefund()
raiseDispute()
```

### 👨‍💻 Freelancer Operations

```text
startWork()
submitWork()
raiseDispute()
```

### ⚖️ Arbitrator Operations

```text
resolveDispute()
```

### 👁️ View Operations

```text
getMilestone()
milestoneCount()
getContractBalance()
```

> Function names may vary depending on the final version of the smart contract.

---

## 📡 Smart Contract Events

Important blockchain events include:

```text
MilestoneCreated
FundsDeposited
WorkStarted
WorkSubmitted
PaymentReleased
RefundIssued
DisputeRaised
DisputeResolved
```

These events can be used by the frontend to display transaction and project activity.

---

## 🔧 Configuration

### Hardhat Configuration

The blockchain development configuration is stored in:

```text
hardhat.config.js
```

### Frontend

The React application is located inside:

```text
frontend/
```

### Contract ABI

```text
frontend/src/abi/FreelanceEscrow.json
```

### Contract Address

If the frontend requires a manually configured address:

```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

> Replace the placeholder with the contract address generated by your local deployment.

---

## 📦 Environment Variables

The local version does not require real private keys or production credentials.

If environment variables are introduced:

```text
.env
```

Example:

```env
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
```

Never commit sensitive credentials to GitHub.

Add secret-containing environment files to `.gitignore`:

```text
.env
.env.local
```

---

## 🔐 Security Considerations

The project implements smart-contract-level validation such as:

- Role-based access control
- State validation
- Payment validation
- Restricted arbitrator operations
- Prevention of repeated payment release
- Escrow balance management
- Transaction-based authorization

> ⚠️ **This project is intended for educational purposes and should undergo professional security auditing before handling real funds.**

---

## 🎥 Screenshots 

### 🖥️ Client Dashboard
<img width="1919" height="934" alt="Screenshot 2026-08-24 164350" src="https://github.com/user-attachments/assets/1365cda9-c954-46ef-9768-ccec9ba4ef27" />

### 👨‍💻 Freelancer Dashboard
<img width="1919" height="921" alt="Screenshot 2026-08-24 164203" src="https://github.com/user-attachments/assets/c14ea09d-b6d7-4067-acf9-c141dba03179" />

### ⚖️ Arbitrator Dashboard
<img width="1916" height="1005" alt="Screenshot 2026-08-24 165828" src="https://github.com/user-attachments/assets/b08dd131-4c31-46ad-b0e0-4604d4a6d81a" />

### 💰 Escrow Funding
<img width="494" height="628" alt="Screenshot 2026-08-24 171259" src="https://github.com/user-attachments/assets/83f85798-b552-4789-b02c-ae914b175209" />

---

## 🔄 Complete Project Flow

| Stage | Participant | Action |
|---|---|---|
| 1 | 👤 Client | Create milestone |
| 2 | 👤 Client | Set custom amount |
| 3 | 👤 Client | Fund escrow |
| 4 | ⛓️ Smart Contract | Lock funds |
| 5 | 👨‍💻 Freelancer | Start work |
| 6 | 👨‍💻 Freelancer | Submit work |
| 7 | 👤 Client | Approve or raise dispute |
| 8A | ⛓️ Smart Contract | Release payment |
| 8B | ⚖️ Arbitrator | Resolve dispute |
| 9B | ⛓️ Smart Contract | Send freelancer payout + client refund |

---

## 🚀 Future Improvements

- 🏭 Multiple escrow contract support
- ⚖️ Multiple arbitrators
- 🗳️ DAO-based dispute resolution
- 🔔 Notification system
- 📱 Improved mobile responsiveness
- 🔐 Professional smart contract security audit

---

## 🎓 Learning Outcomes

This project provided practical experience with:

- Solidity
- Smart contract development
- Ethereum-compatible blockchain concepts
- Hardhat
- Ethers.js
- React
- MetaMask
- Web3 DApp development
- Role-based access control
- Payable functions
- ETH transfers
- Smart contract events
- Escrow architecture
- Milestone-based payments
- Refund mechanisms
- Dispute resolution
- Arbitrator-based settlement
- Automated smart contract testing
- Git and GitHub

---

## ⚠️ Limitations

This project is primarily intended for **educational and demonstration purposes**.

Current limitations:
- Uses a local blockchain for development.
- Does not represent a production freelance marketplace.
- No production KYC/AML system is implemented.
- Work files are not permanently stored on-chain.
- Arbitrator decisions depend on the configured arbitrator.
- Production deployment would require additional security auditing.
- Real-money usage would require additional legal, security, and compliance considerations.

---

## 📜 License

This project is currently provided for **educational purposes**.

---

## 📞 Contact

### 👩‍💻 Author

**Shubhashree Nayak**

### 🐙 GitHub
https://github.com/shubha229

### 💼 LinkedIn
https://www.linkedin.com/in/shubhashree-b-nayak/

---

## ⭐ Project Highlights

| Feature | Included |
|---|:---:|
| 🔐 Smart Contract Escrow | ✅ |
| 💰 Custom Milestone Payments | ✅ |
| 👥 Role-Based Access | ✅ |
| 👤 Client Dashboard | ✅ |
| 👨‍💻 Freelancer Dashboard | ✅ |
| ⚖️ Arbitrator Dashboard | ✅ |
| 📤 Work Submission | ✅ |
| ✅ Payment Release | ✅ |
| ↩️ Refund Mechanism | ✅ |
| ⚖️ Dispute Resolution | ✅ |
| 💵 Freelancer Earnings | ✅ |
| 📜 Payment History | ✅ |
| 📊 Milestone Tracking | ✅ |
| 🦊 MetaMask Integration | ✅ |
| 🧪 Hardhat Testing | ✅ |
| ⚛️ React Frontend | ✅ |

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

</div>
