import React, { Component } from "react";
import SimpleStorageContract from "./build/contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from './ipfs';
import "./App.css";

class App extends Component {
  state = { loading:false, buffer: null, storageValue: 0, web3: null, accounts: null, contract: null };

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3().then(results => {
      this.setState({
        web3: results
      })

      this.run()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  run() {
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = instance
        this.setState({ account: accounts[0] })
        // Get the value from the contract to prove it worked.
        return this.simpleStorageInstance.get(accounts[0])
      }).then((ipfsHash) => {
        console.log(ipfsHash);
        // Update state with the result.
        return this.setState({ ipfsHash })
      })
    })
  }
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
    this.setState({loading:true})
     ipfs.files.add(this.state.buffer, (err, result)=>{
      if (err) {
        console.error(err);
        return
      }
      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        console.log('ifpsHash', this.state.ipfsHash)
      })
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
        {this.state.loading?<p>loading...</p>:<img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>}<br/>
      <form onSubmit={this.submit}>
      <input type="file" onChange={this.fileCapture}></input>
    <input type="submit"></input></form>  </div>
    );
  }
}

export default App;
