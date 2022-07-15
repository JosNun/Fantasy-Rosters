const { Parser } = require("json2csv");
const fs = require("fs");
const fetch = require("node-fetch");

const leagueId = "784455872800772096";

const getRosters = async () => {
  console.log("Getting rosters...");
  const rosters = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`
  )
    .then((res) => res.json())
    .then((rosters) => {
      return rosters.map((roster) => {
        return {
          rosterId: roster.roster_id,
          reserve: roster.reserve ?? [],
          players: roster.players ?? [],
        };
      });
    });

  return rosters;
};

const getPlayers = async () => {
  console.log("Getting players...");
  const players = await fetch(`https://api.sleeper.app/v1/players/nfl`).then(
    (res) => res.json()
  );

  return players;
};

const buildRosters = async () => {
  const rosters = await getRosters();
  const players = await getPlayers();

  rosters.forEach((roster) =>
    roster.players.forEach((playerId, i) => {
      const player = players[playerId];
      roster.players[i] = `${player.first_name} ${player.last_name}`;
    })
  );

  const flattened = rosters.map((roster) => {
    const r = {
      id: roster.rosterId,
    };

    roster.players.forEach((player, i) => {
      r[`player${i + 1}`] = player;
    });

    roster.reserve.forEach((reserve, i) => {
      r[`reserve${i + 1}`] = reserve;
    });

    return r;
  });

  const parser = new Parser();

  console.log("Generating CSV...");
  const csv = parser.parse(flattened);

  fs.writeFileSync("rosters.csv", csv);
  console.log("Done! File written to rosters.csv");

  process.exit(0);
};

buildRosters();
