import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "./Bug.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import logo from "./BUG.jpeg";

function App() {
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [bugId, setBugId] = useState("");
  const [description, setDescription] = useState("");
  const [criticality, setCriticality] = useState("Low");
  const [bugs, setBugs] = useState([]);

  const getCriticalityValue = (criticality) => {
    switch (criticality) {
      case 0:
        return "Low";
      case 1:
        return "Medium";
      case 2:
        return "High";
      default:
        return "Unknown";
    }
  };

  const loadBugsFromContract = async () => {
    try {
      if (contract) {
        const bugCount = await contract.methods
          .getBugCount()
          .call({ from: accounts[0], gas: 3000000 });

        const bugsArray = [];

        for (let i = 0; i < bugCount; i++) {
          const bug = await contract.methods
            .getBug(i)
            .call({ from: accounts[0], gas: 3000000 });

          bug.criticality = Number(bug.criticality);
          bug.criticality = getCriticalityValue(bug.criticality);

          bugsArray.push(bug);
        }

        setBugs(bugsArray);
      }
    } catch (error) {
      console.error("Error loading bugs:", error);
    }
  };

  useEffect(() => {
    const initializeContractAndAccounts = async () => {
      try {
        // Connect to Ganache
        const web3 = new Web3("http://127.0.0.1:7545");

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);

        // Initialize contract
        const instance = new web3.eth.Contract(contractABI, contractAddress);
        setContract(instance);
      } catch (error) {
        console.error("Error initializing contract and accounts:", error);
      }
    };

    initializeContractAndAccounts();
  }, []);

  useEffect(() => {
    const loadBugsIfReady = async () => {
      try {
        // Load bugs only if contract and accounts are available
        if (contract && accounts.length > 0) {
          await loadBugsFromContract();
        }
      } catch (error) {
        console.error("Error loading bugs:", error);
      }
    };

    loadBugsIfReady();
  }, [contract, accounts, loadBugsFromContract]);

  const handleAddBug = async (event) => {
    try {
      // Prevent default form submission behavior
      event.preventDefault();

      // Determine priority value based on selected priority option
      let criticalityValue;
      switch (criticality) {
        case "Low":
          criticalityValue = 0;
          break;
        case "Medium":
          criticalityValue = 1;
          break;
        case "High":
          criticalityValue = 2;
          break;
        default:
          criticalityValue = -1;
      }

      // Log priority and its numeric value for debugging
      console.log(
        "Criticality:",
        criticality,
        "Numeric Value:",
        criticalityValue
      );

      // Send transaction to add bug to the blockchain
      await contract.methods
        .addBug(bugId, description, criticalityValue)
        .send({ from: accounts[0], gas: 3000000 });

      // Reset bug form fields
      setBugId("");
      setDescription("");
      setCriticality("Low");

      // Fetch updated bug list from the blockchain
      await loadBugsFromContract();
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error adding bug:", error);
    }
  };

  const updateBugStatus = async (bugIndex) => {
    try {
      // Send transaction to update bug status
      await contract.methods
        .updateBugStatus(bugIndex, true)
        .send({ from: accounts[0], gas: 3000000 });

      // Fetch updated bug list after successful update
      await loadBugsFromContract();
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error updating bug status:", error);
    }
  };

  const handleDeleteBug = async (bugIndex) => {
    try {
      // Fetch the bug to check its status
      const bug = await contract.methods
        .getBug(bugIndex)
        .call({ from: accounts[0], gas: 300000 });

      // Check if the bug is resolved before attempting to delete it
      if (bug.isResolved) {
        // Send transaction to delete bug
        await contract.methods
          .deleteBug(bugIndex)
          .send({ from: accounts[0], gas: 300000 });

        // Fetch updated bug list after successful deletion
        await loadBugsFromContract();
      } else {
        // Log a message indicating that the bug cannot be deleted because it's not resolved
        console.log("Bug cannot be deleted because it is not resolved.");
      }
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error deleting bug:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            Bug Tracker
            <img
              src={logo}
              alt="App Logo"
              style={{
                width: "30px",
                verticalAlign: "middle",
                marginLeft: "12px",
              }}
            />
          </h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-sm-6">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Bug ID"
                value={bugId}
                onChange={(e) => setBugId(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6 ">
              <select
                className="form-select mb-3 "
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
              >
                <option value="Low">LOW</option>
                <option value="Medium">MEDIUM</option>
                <option value="High">HIGH</option>
              </select>
            </div>
            <div className="col-sm-12">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddBug}
              >
                Add Bug
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">Bugs List</h5>
          <ul className="list-group">
            {bugs.map(
              (bug, index) =>
                bug.bugId && (
                  <li key={index} className="list-group-item">
                    <div>
                      <strong>Bug ID:</strong> {bug.bugId}
                    </div>
                    <div>
                      <strong>Description:</strong> {bug.description},{" "}
                      <strong>Priority:</strong> {bug.priority},{" "}
                      <strong>Resolved:</strong> {bug.isResolved ? "Yes" : "No"}
                    </div>
                    <div className="btn-group">
                      {!bug.isResolved && (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => updateBugStatus(index)}
                        >
                          Mark as Resolved
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeleteBug(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
