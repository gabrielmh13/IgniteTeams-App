import { playerGetByGroup } from "./playersGetByGroup";

export async function playerGetByGroupAndTeam(group: string, team: string){
    try {
        const storage = await playerGetByGroup(group)

        const players = storage.filter(player => player.team === team)

        return players
    } catch (err) {
        throw err
    }
}