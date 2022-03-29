
import React, {useState, useEffect} from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3'
import Tether from '../truffle_abis/Tether.json'
import RWD from '../truffle_abis/RWD.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'

const  App = (props) =>  {

  const [account, setAccount] = useState('0x0')
  const [tether, setTether] = useState({})
  const [rwd, setRWD] = useState({})
  const [decentralBank, setDecentralBank] = useState({})
  const [tetherBalance, setTetherBalance] = useState('0')
  const [rwdBalance, setRWDBalance] = useState('0')
  const [stakingBalance, setStakingBalance] = useState('0')
  const [loadings, setLoadings] = useState(true)

  useEffect(() => {
    loadWeb3()
    loadBlockChainData()

    }, [])

  const loadWeb3 = async ()  => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non ethereum browser detected. You should consider Metamask!')
    }
  }
    
  const loadBlockChainData = async () => {
      const web3 = window.web3
      const accounts = await web3.eth.getAccounts()
      setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId()

    //LOAD Tether TOKEN
    const tetherData = Tether.networks[networkId]
    if(tetherData) {
      const tether = new web3.eth.Contract(Tether.abi, tetherData.address)
      setTether(tether)

      let tetherBalance = await tether.methods.balanceOf(accounts[0]).call()
      setTetherBalance(tetherBalance.toString())
    } else {
      window.alert("tether contract not deployed to detect network")
    }

    //LOAD RWD TOKEN
      const rwdTokenData = RWD.networks[networkId]
      if(rwdTokenData) {
        const rwd = new web3.eth.Contract(RWD.abi, rwdTokenData.address)
        setRWD(RWD)
        let rwdTokenBalance = await rwd.methods.balanceOf(accounts[0]).call()
        setRWDBalance(rwdTokenBalance.toString())
      } else {
        window.alert("Reward Token contract not deployed to detect network")
      }

       //Load DecentralBank
          const decentralBankData = DecentralBank.networks[networkId]
          if(decentralBankData) {
            const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address)
            setDecentralBank(decentralBank)
            let stakingBalance = await decentralBank.methods.stakingBalance(accounts[0]).call()
            setStakingBalance(stakingBalance.toString())
          } else {
            window.alert("TokenForm contract not deployed to detect network")
          }


          setLoadings(false) 
  }

  const stakeTokens = (amount) => {
    setLoadings(true)
    tether.methods.approve(decentralBank._address, amount).send({from: account}).on('transactionHash', (hash) => {
      decentralBank.methods.depositTokens(amount).send({from: account}).on('transactionHash', (hash) => {
        setLoadings(false)
      })
    }) 
  }

  const unstakeTokens = () => {
    setLoadings(true)
      decentralBank.methods.unstakeTokens().send({from: account}).on('transactionHash', (hash) => {
        setLoadings(false)
    }) 
  }

  const issueTokens = () => {

      decentralBank.methods.issueTokens()
  }


  

    return (
        <div>
            <Navbar account={account}/>
            <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px', minHeight: '100vm'}}>
              <div>
                {loadings ? (
                    <p id="loader" className='text-center' style={{color:'white', margin:'30px'}}>LOADING PLEASE...</p> 
                ) : (
                    <Main
                      tetherBalance={tetherBalance}
                      rwdBalance={rwdBalance}
                      stakingBalance={stakingBalance}
                     stakeTokens={stakeTokens}
                    unstakeTokens={unstakeTokens}
                    decentralBankContract={decentralBank}
                    issueTokens={issueTokens}
                    />
                )}
              </div>
            </main>
        </div>
        </div>
        </div>
    );
}

export default App;