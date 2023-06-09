//get access to a pool 
//buy  a token 
//wait 

const ethers = require('ethers'); // connect to blockchain 
const { getAbi, getPoolData, _getAmountsOut,  handleProxyTokenContract, getTokenData, getRecentSwapData } = require('./helpers')
const { buyPoolTokens, uniSwapTrade, getCurrentPriceUni } = require('./tradehelpers')

const INFURA_URL = process.env.INFURA_URL
const provider = new ethers.providers.JsonRpcProvider(INFURA_URL); //init provider




const uniFactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const sushiFactoryAddress = "0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2";

//https://www.geckoterminal.com/polygon_pos/pools/0xa33f2ec45035658c26a47c356706e9e506f867d0
//use this to find pools


/**
 * 0.1 of token 0 return the amount bought
 *if token 0 price goes up by 5% sell the amount bought. 
 * 5 % should be enough to cover for goes, slippage and tax fees
 * 
 * 
 */

const main = async() =>{
    //get and print data about the trading pool
    const INCREASE_VALUE = 2 //tx 0.1% max
    const TRADE_AMOUNT = 0.1
    console.log(" ")
    console.log("TRADING BOT STARTED")
    console.log("-------------------")
    
    let swaps = await getPositiveIO()
    console.log(await swaps)

    //GET most recent pool from list of swaps
    //This is how you find pools to make the youtube video work
    //Make a single trade but don't swap back
    //For now this wont make sense but long term when you do a flash swap you can keep the profits.

    console.log(" ")
    console.log("TRADING BOT STARTED")
    console.log("-------------------")

    
    //pooladdress = "0x9520dbd4c8803f5c6850742120b471cda0aac954" // PODO

    //NEW POOLS
    /*
    let poolABI = await getAbi(pooladdress)
    let poolData = await getPoolData(pooladdress,poolABI)
    
    let token0 = poolData.token0
    let token1 = poolData.token1
    let tokenData0 = await getTokenData(token0)
    let tokenData1 = await getTokenData(token1)
    let tokenIDs = [token0,token1]
    
    let tokenPaths = [tokenData0.symbol,tokenData1.symbol]
    let tokenDecimals = [tokenData0.decimals,tokenData1.decimals] 
    let slippage = 0.75
    const BUY_AMOUNT = TRADE_AMOUNT
    //TRADE_AMOUNT + (TRADE_AMOUNT * ((poolData.fee/10000)/100)) + (TRADE_AMOUNT * (slippage/100))
    console.log(BUY_AMOUNT)

    console.log(" ")
    console.log("INITITAL PRICE CHECK")
    console.log("-------------------")
    let boughtPrice = await getCurrentPriceUni(tokenIDs,tokenPaths,tokenDecimals, BUY_AMOUNT)
    
    
   
    //GET CURRENT PRICE
        //get price pool from contract
        //convert slot to current price


    console.log(" ")
    console.log("INITAL TRADE STARTED")
    console.log("-------------------")
    let swapData = await uniSwapTrade(BUY_AMOUNT, pooladdress, tokenIDs, tokenPaths, tokenDecimals)
    let tokens1Bought = swapData.amount1
        console.log(`boughtPrice: ${boughtPrice}`)
        console.log(`tokens1Bought ${tokens1Bought}`)
    
    //BUY TOKEN 1 with TOKEN 0
    
    let updatedPrice
    
   
    
    let priceMonitor = setInterval(async () => { 
        console.log(" ")
        console.log("PRICE POLLING RUNNING")
        console.log("-------------------")
        let price_diff_perc 
        let price_diff_perc_test = 0
        var currentdate = new Date();
        //worth using try catch here
        //if an error ouput 0 then set price difference to error and continue
        try{
            updatedPrice = await getCurrentPriceUni(tokenIDs,tokenPaths,tokenDecimals, BUY_AMOUNT) 
            console.log(`boughtPrice: ${boughtPrice}`)
            console.log(`updatedPrice: ${updatedPrice}`)
            console.log(`price difference: ${updatedPrice-boughtPrice}`)
        
            console.log(currentdate)
            price_diff_perc = ((updatedPrice - boughtPrice)/ boughtPrice)*100
        
        console.log(`price change since purchase in ${pooladdress} ${price_diff_perc}%`)

        }catch{
            
            console.log(`boughtPrice: ${boughtPrice}`)
            console.log(`updatedPrice: ${0}`)
            console.log(`price difference: Not avialable`)
            
            console.log(currentdate)
            price_diff_perc = ((updatedPrice - boughtPrice)/ boughtPrice)*100
            
            console.log(`price% change since purchase in : Not avialable`)

        }
        
       
        //price_diff_perc_test++
            
            
        
        if (price_diff_perc>=INCREASE_VALUE){
            //if price increases above 2% long term we will use 5% 
            //stop the interval 
            console.log(" ")
            console.log("REVERT TRADE STARTED")
            console.log("-------------------")
            let swapData = await uniSwapTrade(tokens1Bought, pooladdress, tokenIDs.reverse(), tokenPaths.reverse(), tokenDecimals.reverse())
    
            console.log(swapData)
            console.log(`started: ${BUY_AMOUNT}, ended: ${swapData.amount1},  profit: ${ swapData.amount1 - BUY_AMOUNT} `)
            console.log("UPLOAD trade data to csv")
            
            //trade data: input, output, profit, time,
            //eventually will change up to up date trade data
            clearInterval(priceMonitor)
            
        }
       

    }, 30000)

    

    */


    
}

const getTokenContract = async(address) =>{
    ERC20ABI = await getAbi(address)
    const tokenContract = new ethers.Contract(
        address,
        ERC20ABI,
   
        provider
      )

    if(tokenContract.decimals == undefined){
       tokenContract = await handleProxyTokenContract(address,ERC20ABI)
       return tokenContract
    }
    
    return tokenContract

      //if proxy contract handle as proxy
}

const getCurrentPrice = async(pooladdress, poolABI,tokenIDs, tokenDecimals, tokenPaths) => {
    
    const AMOUNT = 1
    let _tickData = await getPoolData(pooladdress,poolABI)
    let tick = _tickData.slot0.tick
   
    
    let currentPrice = await _getAmountsOut(AMOUNT,tokenIDs, tick, tokenDecimals)
    //console.log(tick)
    //console.log(currentPrice)
    console.log(`${AMOUNT} ${tokenPaths[0]} can be swapped for ${currentPrice} ${tokenPaths[1]}`)
    return(currentPrice)
}

const getPositiveIO = async() =>{
    let recentSwapData = await getRecentSwapData()
    //console.log(recentSwapData)
    let swaps = []

    for (let swap in recentSwapData){
        console.log(false)
        if(recentSwapData[swap].amountOutUSD !=0 && recentSwapData[swap].amountInUSD !=0 &&  recentSwapData[swap].amountOutUSD > recentSwapData[swap].amountInUSD){
            swaps.push(recentSwapData[swap])
            console.log(true)

        }

    }

    return swaps

}

main()


