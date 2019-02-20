defmodule Unogame.GameServer do
  use GenServer

  def reg(name) do
    {:via, Registry, {Unogame.GameReg, name}}
  end

  def start(name) do
    spec = %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [name]},
      restart: :permanent,
      type: :worker,
    }
    Hangman.GameSup.start_child(spec)
  end

  def start_link(name) do
    game = Unogame.BackupAgent.get(name) || Unogame.Game.new()
    GenServer.start_link(__MODULE__, game, name: reg(name))
  end

  #TODO add game functionality
  def draw_card(name, playerid) do
    GenServer.call(reg(name), {:play_card, name, playerid})
  end

  def play_card(name, playerid, card) do
    GenServer.call(reg(name), {:play_card, name, playerid, card})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  def init(game) do
    {:ok, game}
  end

  def handle_call({:draw_card, name, playerid}, _from, game) do
    game = Unogame.Game.draw_card(game, playerid)
    Unogame.BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:draw_card, name, playerid, card}, _from, game) do
    game = Unogame.Game.draw_card(game, playerid, card)
    Unogame.BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end
end
