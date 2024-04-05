// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract BugTracker {
    enum Criticality {
        Low,
        Medium,
        High
    }

    struct Bug {
        string bugId;
        string description;
        bool isResolved;
        Criticality criticality;
    }

    mapping(address => Bug[]) users;

    function addBug(string calldata _bugId, string calldata _description, Criticality _criticality) external {
        users[msg.sender].push(Bug({ bugId: _bugId, description: _description, isResolved: false, criticality: _criticality }));
    }

    function getBug(uint256 _bugIndex) external view returns (Bug memory) {
        require(_bugIndex < users[msg.sender].length, "Bug index out of bounds");
        Bug storage bug = users[msg.sender][_bugIndex];
        return bug;
    }

    function updateBugStatus(uint256 _bugIndex, bool _isResolved) external {
        require(_bugIndex < users[msg.sender].length, "Bug index out of bounds");
        users[msg.sender][_bugIndex].isResolved = _isResolved;
    }

    function getBugCount() external view returns (uint256) {
        return users[msg.sender].length;
    }

    function deleteBug(uint256 _bugIndex) external returns (bool) {
        require(_bugIndex < users[msg.sender].length, "Bug index out of bounds");
        require(users[msg.sender][_bugIndex].isResolved, "Bug is not resolved");

        delete users[msg.sender][_bugIndex];
        return true;
    }
}
