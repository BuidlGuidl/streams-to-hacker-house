import React, { useEffect, useState } from "react";
import Head from "next/head";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { Contributions } from "~~/components/Contributions";
import { HackerStreams } from "~~/components/HackerStreams";
import { StreamContract } from "~~/components/StreamContract";
import { useScaffoldContractRead, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

type BuilderData = {
  cap: BigNumber;
  unlockedAmount: BigNumber;
  builderAddress: string;
};

const Home: NextPage = () => {
  const { address } = useAccount();

  const [builderList, setBuilderList] = useState<string[]>([]);

  const { data: allBuildersData, isLoading: isLoadingBuilderData } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "allBuildersData",
    args: [builderList],
  });

  const { data: streamData } = useDeployedContractInfo("YourContract");

  const { data: withdrawEvents, isLoading: isLoadingWithdrawEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "Withdraw",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    blockData: true,
  });

  const { data: addBuilderEvents, isLoading: isLoadingBuilderEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "AddBuilder",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
  });

  useEffect(() => {
    if (addBuilderEvents && addBuilderEvents.length > 0) {
      const fetchedBuilderList = addBuilderEvents.map((event: any) => event.args.to);
      const uniqueBuilderList = [...new Set(fetchedBuilderList)];
      filterBuilders(uniqueBuilderList)
        .then(filteredBuilders => {
          setBuilderList(filteredBuilders as string[]);
        })
        .catch(error => {
          console.error(error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBuilderEvents]);

  const amIAStreamedBuilder = allBuildersData?.some(
    (builderData: BuilderData) => builderData.builderAddress === address,
  );

  const title = "🏔 Denver Hacker House Crew";

  const isZeroCap = async (address: string) => {
    if (streamData) {
      const data = await readContract({
        address: streamData?.address as string,
        abi: streamData?.abi,
        functionName: "streamedBuilders",
        args: [address],
      });

      const { cap } = data;
      if (cap !== undefined && Number(cap) > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  const filterBuilders = async (builderList: string[]) => {
    const filteredBuilders = await Promise.all(
      builderList.map(async address => {
        if (await isZeroCap(address)) {
          return address;
        }
      }),
    );
    return filteredBuilders.filter(Boolean);
  };

  return (
    <>
      <Head>
        <title></title>
        <meta
          name="description"
          content="We're running an experiment to retroactively fund open-source work by providing a monthly stream of ETH to Ethereum developers, handpicked by Waylon Jepsen, Colin Roberts, Alexis Bednarick and Jessy from Jessy's Hacker House. We are rewarding up-and-coming high-impact devs for their ongoing contributions to the ecosystem."
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="We're running an experiment to retroactively fund open-source work by providing a monthly stream of ETH to Ethereum developers, handpicked by Waylon Jepsen, Colin Roberts, Alexis Bednarick and Jessy from Jessy's Hacker House.
          We are rewarding up-and-coming high-impact devs for their ongoing contributions
          to the ecosystem."
        />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_VERCEL_URL || ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10 mb-20 mx-auto font-grotesk gap-5">
        <h1 className="font-bold text-4xl pb-8 visible md:hidden">Jessy's Hacker House</h1>
        <div className="max-w-[42rem] m-auto w-[90%] bg-secondary px-8 py-4 rounded-2xl">
          <p className="font-bold text-left text-4xl leading-6 py-2">{title}</p>
          <p>
            We're running an experiment to retroactively fund open-source work by providing a monthly stream of ETH to
            Ethereum developers, handpicked by{" "}
            <a
              target="_blank"
              href="https://twitter.com/0xjepsen"
              rel="noreferrer"
              className="text-white cursor-pointer"
            >
              Waylon Jepsen
            </a>
            ,{" "}
            <a
              target="_blank"
              href="https://twitter.com/Autoparallel"
              rel="noreferrer"
              className="text-white cursor-pointer"
            >
              Colin Roberts
            </a>
            ,{" "}
            <a
              target="_blank"
              href="https://twitter.com/solidityslayer"
              rel="noreferrer"
              className="text-white cursor-pointer"
            >
              Alexis Bednarick
            </a>{" "}
            and{" "}
            <a
              target="_blank"
              href="https://twitter.com/13yearoldvc"
              rel="noreferrer"
              className="text-white cursor-pointer"
            >
              Jessy
            </a>{" "}
            from{" "}
            <a
              target="_blank"
              href="https://twitter.com/wehack247"
              rel="noreferrer"
              className="pl-1 text-white cursor-pointer"
            >
              Jessy's Hacker House
            </a>
            .
          </p>
          <p>We are rewarding up-and-coming high-impact devs for their ongoing contributions to the ecosystem.</p>
          <p>
            Chosen developers can submit their monthly projects, automatically claim grant streams, and showcase their
            work to the public.
          </p>
          <p>
            funded by{" "}
            <a
              target="_blank"
              href="https://buidlguidl.com"
              rel="noreferrer"
              className="pl-1 text-white cursor-pointer"
            >
              🏰 BuidlGuidl
            </a>
            !
          </p>
        </div>

        <div className="max-w-[42rem] m-auto w-[90%] bg-secondary rounded-2xl px-6 py-4">
          <div>🎥 Update From Hackers: July 28, 2023 🎞</div>
          <div className="px-8 py-8 flex justify-center">
            <div className="">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  title="Hacker House Update"
                  className="aspect-content"
                  src="https://www.youtube.com/embed/m6kKCP220n0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[42rem] m-auto w-[90%] bg-secondary rounded-2xl">
          <h2 className="font-bold text-2xl px-8 py-4 border-b-2">⏳ ETH Streams</h2>
          <div>
            <HackerStreams
              allBuildersData={allBuildersData}
              withdrawEvents={withdrawEvents}
              isLoadingBuilderData={isLoadingBuilderData}
              isLoadingBuilderEvents={isLoadingBuilderEvents}
            />
          </div>
          <h2 className="font-bold text-2xl px-8 py-4 border-b-2 bg-accent">📑 Contract Details</h2>
          <div className="p-0 bg-accent rounded-b-2xl">
            <StreamContract amIAStreamedBuilder={amIAStreamedBuilder} />
          </div>
        </div>

        <div className="max-w-[42rem] m-auto w-[90%] bg-secondary rounded-2xl">
          <h2 className="font-bold text-2xl px-8 py-4 border-b-2">Contributions</h2>
          <div className="p-0">
            <Contributions withdrawEvents={withdrawEvents} isLoadingWithdrawEvents={isLoadingWithdrawEvents} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
