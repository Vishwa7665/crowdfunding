document.addEventListener('DOMContentLoaded', async function () {
    const campaignId = getCampaignIdFromURL();
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xEa3be3332E10A2A71B9De1B06a7275D9082A8061';
    const abi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_token",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "CampaignEnded",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "CampaignNotEnded",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                }
            ],
            "name": "cancelContribution",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "contribute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_goal",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_duration",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_title",
                    "type": "string"
                }
            ],
            "name": "createCampaign",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "FundsAlreadyWithdrawn",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "GoalNotReached",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "IsNotOwner",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "IsOwner",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "NoContributions",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "campaignId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "goal",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "CampaignCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "campaignId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "contributor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "ContributionCanceled",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "campaignId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "contributor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "ContributionMade",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "campaignId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "FundsWithdrawn",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                }
            ],
            "name": "refund",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "campaignId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "contributor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Refunded",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                }
            ],
            "name": "withdrawFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "campaignCounter",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "campaigns",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "goal",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalFunds",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "withdrawn",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "contributions",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "contributors",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getAllCampaigns",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "titles",
                    "type": "string[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "campaignIds",
                    "type": "uint256[]"
                },
                {
                    "internalType": "address[]",
                    "name": "creators",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "goals",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "deadlines",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "totalFunds",
                    "type": "uint256[]"
                },
                {
                    "internalType": "bool[]",
                    "name": "withdrawnStatus",
                    "type": "bool[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                }
            ],
            "name": "getAllContributions",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                }
            ],
            "name": "getCampaign",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "remainingTime",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "goal",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalFunds",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_campaignId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_user",
                    "type": "address"
                }
            ],
            "name": "getContribution",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "token",
            "outputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (campaignId) {

        try {
            const campaign = await contract.methods.getCampaign(campaignId).call();
            console.log(campaign);
            displayCampaignDetails(campaign);

            document.getElementById('contribute-form').addEventListener('submit', async function (event) {
                event.preventDefault();
                const amount = document.getElementById('amount').value;
                await contributeToCampaign(campaignId, amount);
            });

            document.getElementById('withdraw-funds').addEventListener('click', async function () {
                await withdrawFunds(campaignId);
            });

            document.getElementById('refund').addEventListener('click', async function () {
                await refund(campaignId);
            });
        } catch (error) {
            console.error('Error fetching campaign data:', error);
        }
    } else {
        alert('No campaign ID provided');
    }

    function getCampaignIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams);
        return urlParams.get('id');
    }

    function displayCampaignDetails(campaign) {
        document.getElementById('campaign-title').textContent = campaign.title;
        document.getElementById('campaign-goal').textContent = web3.utils.fromWei(campaign.goal, 'ether');
        document.getElementById('campaign-total-funds').textContent = web3.utils.fromWei(campaign.totalFunds, 'ether');
        const remainingTime = Number(campaign.remainingTime)
        const now = new Date();
        const deadlineDate = new Date(now.getTime() + remainingTime * 1000);

        if (remainingTime <= 0) {
            document.getElementById('campaign-deadline').textContent = 'Campaign ended';
        } else {
            document.getElementById('campaign-deadline').textContent = deadlineDate.toLocaleString();
        }
    }

    async function contributeToCampaign(campaignId, amount) {
        const accounts = await web3.eth.getAccounts();
        const weiAmount = web3.utils.toWei(amount, 'ether');
        await contract.methods.contribute(campaignId, weiAmount).send({ from: accounts[0] });
        alert('Contribution successful!');
    }

    async function withdrawFunds(campaignId) {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.withdrawFunds(campaignId).send({ from: accounts[0] });
        alert('Funds withdrawn!');
    }

    async function refund(campaignId) {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.refund(campaignId).send({ from: accounts[0] });
        alert('Refund successful!');
    }
});
