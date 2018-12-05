import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from './ipfs';
import "./App.css";

class App extends Component {
  state = { buffer: null, storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.set(5, { from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.get();

    // Update state with the result.
    this.setState({ storageValue: response.toNumber() });
  };
  fileCapture = (event) =>{
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }
  submit = (event) =>{
    event.preventDefault()
     ipfs.files.add(this.state.buffer, (err, result)=>{
      if (err) {
        console.error(err);
        return
      }
      this.setState({ipfsHash: result[0].hash})
      console.log("ipfsHash", this.state.ipfsHash);
    })
  }
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>IPFS File Upload!</h1>
        <p>This image is stored on IPFS and Ethereum Blockchain!</p>
        <img src="" alt=""/>
      <form onSubmit={this.submit}>
      <input type="file" onChange={this.fileCapture}></input>
    <input type="submit"></input></form>  </div>
    );
  }
}

export default App;
