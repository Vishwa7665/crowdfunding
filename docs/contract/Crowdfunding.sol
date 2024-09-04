// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

error IsNotOwner();
error IsOwner();
error CampaignEnded();
error CampaignNotEnded();
error GoalNotReached();
error NoContributions();
error FundsAlreadyWithdrawn();

contract Crowdfunding {
    struct Campaign {
        address creator;
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalFunds;
        bool withdrawn;
    }

    IERC20 public token;
    uint256 public campaignCounter;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) public contributors;

    event CampaignCreated(
        uint256 campaignId,
        address creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    event ContributionMade(
        uint256 campaignId,
        address contributor,
        uint256 amount
    );
    event ContributionCanceled(
        uint256 campaignId,
        address contributor,
        uint256 amount
    );
    event FundsWithdrawn(uint256 campaignId, address creator, uint256 amount);
    event Refunded(uint256 campaignId, address contributor, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    modifier onlyOwner(uint256 _campaignId) {
        if (msg.sender != campaigns[_campaignId].creator) revert IsNotOwner();
        _;
    }

    modifier notOwner(uint256 _campaignId) {
        if (msg.sender == campaigns[_campaignId].creator) revert IsOwner();
        _;
    }

    modifier beforeDeadline(uint256 _campaignId) {
        if (block.timestamp >= campaigns[_campaignId].deadline)
            revert CampaignEnded();
        _;
    }

    modifier afterDeadline(uint256 _campaignId) {
        if (block.timestamp < campaigns[_campaignId].deadline)
            revert CampaignNotEnded();
        _;
    }

    modifier goalNotReached(uint256 _campaignId) {
        if (campaigns[_campaignId].totalFunds >= campaigns[_campaignId].goal)
            revert GoalNotReached();
        _;
    }

    modifier fundsNotWithdrawn(uint256 _campaignId) {
        if (campaigns[_campaignId].withdrawn) revert FundsAlreadyWithdrawn();
        _;
    }

    function createCampaign(
        uint256 _goal,
        uint256 _duration,
        string calldata _title
    ) external {
        if (_goal <= 0) revert GoalNotReached();
        if (_duration <= 0) revert CampaignEnded();

        campaignCounter++;
        uint256 deadline = block.timestamp + _duration;

        campaigns[campaignCounter] = Campaign({
            creator: msg.sender,
            title: _title,
            goal: _goal,
            deadline: deadline,
            totalFunds: 0,
            withdrawn: false
        });

        emit CampaignCreated(
            campaignCounter,
            msg.sender,
            _title,
            _goal,
            deadline
        );
    }

    function contribute(
        uint256 _campaignId,
        uint256 _amount
    ) external notOwner(_campaignId) beforeDeadline(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        token.transferFrom(msg.sender, address(this), _amount);

        if (contributions[_campaignId][msg.sender] == 0) {
            contributors[_campaignId].push(msg.sender);
        }

        contributions[_campaignId][msg.sender] += _amount;
        campaign.totalFunds += _amount;

        emit ContributionMade(_campaignId, msg.sender, _amount);
    }

    function cancelContribution(
        uint256 _campaignId
    ) external beforeDeadline(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        if (contributedAmount == 0) revert NoContributions();

        contributions[_campaignId][msg.sender] = 0;
        campaign.totalFunds -= contributedAmount;

        token.transfer(msg.sender, contributedAmount);

        emit ContributionCanceled(_campaignId, msg.sender, contributedAmount);
    }

    function withdrawFunds(
        uint256 _campaignId
    )
        external
        onlyOwner(_campaignId)
        afterDeadline(_campaignId)
        fundsNotWithdrawn(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];

        if (campaign.totalFunds < campaign.goal) revert GoalNotReached();

        campaign.withdrawn = true;
        token.transfer(campaign.creator, campaign.totalFunds);

        emit FundsWithdrawn(_campaignId, msg.sender, campaign.totalFunds);
    }

    function refund(
        uint256 _campaignId
    ) external afterDeadline(_campaignId) goalNotReached(_campaignId) {
        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        if (contributedAmount == 0) revert NoContributions();

        contributions[_campaignId][msg.sender] = 0;

        token.transfer(msg.sender, contributedAmount);

        emit Refunded(_campaignId, msg.sender, contributedAmount);
    }

    function getContribution(
        uint256 _campaignId,
        address _user
    ) external view returns (uint256) {
        return contributions[_campaignId][_user];
    }

    function getCampaign(
        uint256 _campaignId
    )
        external
        view
        returns (
            string memory title,
            uint256 remainingTime,
            uint256 goal,
            uint256 totalFunds
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        title = campaign.title;
        remainingTime = campaign.deadline > block.timestamp
            ? campaign.deadline - block.timestamp
            : 0;
        goal = campaign.goal;
        totalFunds = campaign.totalFunds;
    }

    function getAllContributions(
        uint256 _campaignId
    ) external view returns (address[] memory, uint256[] memory) {
        address[] memory contribs = contributors[_campaignId];
        uint256[] memory amounts = new uint256[](contribs.length);

        for (uint256 i = 0; i < contribs.length; i++) {
            amounts[i] = contributions[_campaignId][contribs[i]];
        }

        return (contribs, amounts);
    }

    function getAllCampaigns()
        external
        view
        returns (
            string[] memory titles,
            uint256[] memory campaignIds,
            address[] memory creators,
            uint256[] memory goals,
            uint256[] memory deadlines,
            uint256[] memory totalFunds,
            bool[] memory withdrawnStatus
        )
    {
        uint256 numCampaigns = campaignCounter;

        campaignIds = new uint256[](numCampaigns);
        creators = new address[](numCampaigns);
        titles = new string[](numCampaigns);
        goals = new uint256[](numCampaigns);
        deadlines = new uint256[](numCampaigns);
        totalFunds = new uint256[](numCampaigns);
        withdrawnStatus = new bool[](numCampaigns);

        for (uint256 i = 0; i < numCampaigns; i++) {
            Campaign storage campaign = campaigns[i + 1];

            campaignIds[i] = i + 1;
            creators[i] = campaign.creator;
            titles[i] = campaign.title;
            goals[i] = campaign.goal;
            deadlines[i] = campaign.deadline;
            totalFunds[i] = campaign.totalFunds;
            withdrawnStatus[i] = campaign.withdrawn;
        }
    }
}
