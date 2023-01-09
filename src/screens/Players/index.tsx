import { Alert, FlatList, TextInput } from "react-native";
import { ButtonIcon } from "@components/ButtonIcon";
import { Filter } from "@components/Filter";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { Input } from "@components/Input";
import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";
import { useState, useEffect, useRef } from "react";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppError } from "@utils/AppError";
import { PlayerAddByGroup } from "@storage/player/playerAddByGroup";
import { playerGetByGroupAndTeam } from "@storage/player/playerGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";
import { Loading } from "@components/Loading";

type RouteParams = {
  group: string
}

export function Players() {
  const [isLoading, setIsLoading] = useState(true)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [team, setTeam] = useState('Time A')
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([])

  const route = useRoute()
  const {group} = route.params as RouteParams

  const navigation = useNavigation()

  const newPlayerNameInputRef = useRef<TextInput>(null)

  async function handleAddPlayer(){
    if(newPlayerName.trim().length === 0){
      return Alert.alert('Nova pessoa', 'Informe o nome da pessoa para adicionar.')
    }

    const newPlayer = {
      name: newPlayerName,
      team
    }

    try {
      await PlayerAddByGroup(newPlayer, group)
    
      newPlayerNameInputRef.current?.blur()

      setNewPlayerName('')
      fetchPlayersByTeam()

    } catch (err) {
      if(err instanceof AppError) {
        Alert.alert('Nova pessoa', err.message)
      }
      else {
        Alert.alert('Nova pessoa', 'Não foi possível adicionar.')
      }
    }
  }

  async function fetchPlayersByTeam(){
    try {
      setIsLoading(true)
      const playersByTeam = await playerGetByGroupAndTeam(group, team)
      setPlayers(playersByTeam)

    } catch (err) {
      Alert.alert('Pessoas', 'Não foi possível carregar as pessoas do time selecionado.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePlayerRemove(playerName: string){
    try {
      await playerRemoveByGroup(playerName, group)
      fetchPlayersByTeam()

    } catch (err) {
      Alert.alert('Remover pessoa', 'Não foi possível remover essa pessoa.')
    }
  }

  async function groupRemove(){
    try {
      await groupRemoveByName(group)
      navigation.navigate('groups')

    } catch (err) {
      Alert.alert('Remover', 'Não foi possível remover a turma.')
    }
  } 


  async function handleGroupRemove(){
    Alert.alert('Remover', 'Deseja remover a turma?', [
      {
        text: 'Não',
        style: 'cancel'
      },
      {
        text: 'Sim',
        onPress: () => groupRemove()
      }
    ])
  }

  useEffect(() => {
    fetchPlayersByTeam()
  }, [team])

  return (
    <Container>
        <Header showBackButton/>

        <Highlight 
          title={group} 
          subtitle="adicione a galera e separe os times"
        />

        <Form>
            <Input
                inputRef={newPlayerNameInputRef}
                placeholder="Nome da pessoa"
                autoCorrect={false}
                onChangeText={setNewPlayerName}
                value={newPlayerName}
                onSubmitEditing={handleAddPlayer}
                returnKeyType="done"
            />

            <ButtonIcon type="PRIMARY" icon="add" onPress={handleAddPlayer}/>
        </Form>

        <HeaderList>
          <FlatList 
            data={['Time A', 'Time B']}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <Filter 
                title={item} 
                isActive={item === team}
                onPress={() => setTeam(item)}
              />
            )}
            horizontal
          />

          <NumberOfPlayers>
              {players.length}
          </NumberOfPlayers>

        </HeaderList>

        {isLoading ? <Loading /> : 
          <FlatList 
            data={players}
            keyExtractor={item => item.name}
            renderItem={({item}) => (
              <PlayerCard 
                name={item.name}
                onRemove={() => handlePlayerRemove(item.name)}
              />
            )}
            ListEmptyComponent={() => (
              <ListEmpty 
                messages="Não há pessoas nesse time."
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              {paddingBottom: 100},
              players.length === 0 && {flex: 1}
            ]}
          />
        }

        <Button 
          title="Remover Turma"
          type="SECONDARY"
          onPress={handleGroupRemove}
        />
    </Container>
  );
}