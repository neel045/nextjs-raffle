import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex).toString()
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntraceFee] = useState("0")
    const [numOfPlayers, setNumOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entraceFeeFromCall = (await getEntranceFee()).toString()
        const numOfplayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntraceFee(entraceFeeFromCall)
        setNumOfPlayers(numOfplayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            if (raffleAddress) updateUI()
        }
    }, [isWeb3Enabled])

    const handdleSuccess = async function (tx) {
        await tx.wait(1)
        handdleNewNotificarion(tx)
        updateUI()
    }

    const handdleNewNotificarion = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Hi from Lottery Entrace:
            {raffleAddress ? (
                <div>
                    <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handdleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <>
                                {/* <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"></svg> */}
                                Processing...
                            </>
                        ) : (
                            <>Enter Raffle</>
                        )}
                    </button>
                    <div>Entrace fee is {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The Number of Players: {numOfPlayers}</div>
                    <div>The Recent winner is : {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address detected!</div>
            )}
        </div>
    )
}
