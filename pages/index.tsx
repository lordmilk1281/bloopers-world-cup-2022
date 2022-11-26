import axios from "axios";
import moment from "moment";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Match, Player, Team } from "../types/types";
import { winnerList } from "../winnerList";

type Props = {
  players: Player[];
  fixtures: Match[];
};

export default function Home({ players, fixtures }: Props) {
  const date = moment(new Date()).format("DD MMM YYYY");

  return (
    <div>
      <Head>
        <title>Bloopers Worldcup 2022</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main className="flex divide-x divide-gray-200 2xl:container mx-auto">
        <div className="p-8 space-y-8 w-[1007px]">
          <h1 className="font-qatar-2022-arabic font-bold text-primary-red -tracking-[0.02em] text-3xl border-b border-gray-200 pb-6">
            Bloopers Worldcup 2022{" "}
          </h1>
          <div className="space-y-4">
            <p className="text-gray-900 font-semibold text-base leading-[22px]">
              {date}
            </p>
            <div className="grid grid-cols-2 w-max">
              {fixtures.map((match, index) => (
                <MatchCard key={match.id} {...match} index={index} />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="bg-primary-red font-qatar-2022-arabic text-white   px-3 h-12 flex items-center rounded-lg -tracking-[0.02em] text-lg font-bold">
              Points Table
            </p>
            <div className="px-3 grid grid-cols-2 gap-x-8">
              {players.map((player, index) => (
                <PlayerCard index={index + 1} {...player} key={player.id} />
              ))}
            </div>
          </div>
        </div>
        <div className="w-[432px] space-y-6">
          <p className="py-5 px-6 text-gray-900 text-lg font-medium border-b w-full">
            Winners
          </p>
          <div className="w-[384px] h-[413px] border-[30px] border-[#D9D9D9] rounded-xl mx-6"></div>
          <div className="divide-y divide-gray-200">
            {winnerList.map((winner, index) => {
              const findWinner = players.find(
                player => player.name === winner.name
              );
              return findWinner ? (
                <PlayerCard
                  index={index + 1}
                  showRank={false}
                  {...findWinner}
                  key={findWinner.id}
                />
              ) : null;
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

type MatchCardProps = {
  datetime: string;
  away_team: Team;
  home_team: Team;
  index: number
};

const MatchCard = ({
  datetime,
  away_team,
  home_team,
  index,
}: MatchCardProps) => {
  return (
    <div className={`flex items-center gap-x-6 ${index % 2 === 0 ? "" : "pl-8 border-l border-gray-200"} ${index > 1 ? "pt-4" : ""}`}>
      <p className="w-16 whitespace-nowrap italic text-[#6D6D6D]">{moment(datetime).format("h:mm a")}</p>
      <TeamCard {...home_team} />
      <p className="font-bold text-xl leading-5 w-10">
        {home_team.goals ?? "-"} : {away_team.goals ?? "-"}
      </p>
      <TeamCard {...away_team} isAway />
    </div>
  );
};

type TeamCardProps = {
  name: string;
  country: string;
  isAway?: boolean;
};

const TeamCard = ({ name, country, isAway = false }: TeamCardProps) => {
  const [useName, setUseName] = useState("");

  const getFlag = async () => {
    try {
      const response = await axios.get(
        `https://countryflagsapi.com/png/${country}`
      );

      if (response.status === 200) {
        setUseName(response.data.includes("<!DOCTYPE html>"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFlag();
  }, [name]);

  return (
    <div className={`flex items-center gap-x-2 ${isAway ? "flex-row-reverse" : "flex-row"}`}>
      <div className="w-7 h-5 relative">
        <Image
          alt={name}
          layout="fill"
          src={`https://countryflagsapi.com/png/${useName ? name : country}`}
          className="object-cover rounded-[4px] z-10 ring-1 ring-[#F5F5F5]"
        />
      </div>
      <p className="font-bold leading-[10px]">{country}</p>
    </div>
  );
};

type PlayerCardProps = {
  score: number,
  name: string,
  index: number,
  showRank?: boolean,
}

const PlayerCard = ({ index, score, name, showRank = true }: PlayerCardProps) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 text-sm text-gray-500 ${
        index && index > 2 && showRank ? "border-t border-gray-200" : ""
      }`}
    >
      <div className="flex items-center gap-x-8">
        {showRank && index ? <p>{index}</p> : null}
        {!showRank && index ? <p>MD {index}</p> : null}
        <p className="text-gray-900 font-medium">{name}</p>
      </div>
      <p>{score} Points</p>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const playersRes = await fetch(
    "https://keepthescore.co/api/gcxzugpegbr/board/"
  );
  const playersData = await playersRes.json();

  const fixtureRes = await fetch("https://worldcupjson.net/matches/today");
  const fixtureData = await fixtureRes.json();

  return {
    props: {
      players: playersData.players,
      fixtures: fixtureData,
    },
  };
};