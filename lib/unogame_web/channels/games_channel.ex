defmodule UnogameWeb.GamesChannel do
  use UnogameWeb, :channel

  alias Unogame.Game
  alias Unogame.BackupAgent

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      playerid = payload["playerid"]
      IO.puts(playerid)
      game = BackupAgent.get(name) || Game.new()
      game = game
      |> Game.join_game(playerid)

      socket = socket
      |> assign(:game, game)

      if Game.is_ready?(game) do
        send(self(), :game_ready)
      end

      BackupAgent.put(name, game)
      {:ok, %{"game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:game_ready, socket) do
    name = socket.assigns[:name]
    game = socket.assigns[:game]
    |> Game.deal_cards
    BackupAgent.put(name, game)
    broadcast(socket, "game_ready", %{player_ids: game.player_ids})
    {:noreply, socket}
  end

  # TODO handle input
  def handle_in("get_game", _payload, socket) do
    name = socket.assigns[:name]
    game = BackupAgent.get(name)
    socket = socket
    |> assign(:game, game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end
  def handle_in("draw_card", %{"playerid" => playerid}, socket) do
    try do
      name = socket.assigns[:name]
      game = Game.draw_card(BackupAgent.get(name), playerid)
      socket = socket
      |> assign(:game, game)
      BackupAgent.put(name, game)
      {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
    rescue
      e in ArgumentError -> {:reply, {:error, %{reason: e.message}}, socket}
    end
  end
  # card should be in the format of [color, value]
  def handle_in("play_card", %{"playerid" => playerid, "card" => card}, socket) do
    try do
      name = socket.assigns[:name]
      game = Game.play_card(BackupAgent.get(name), playerid, card)
      socket = socket
      |> assign(:game, game)
      BackupAgent.put(name, game)

      if Game.game_over?(game) do
        IO.puts("game over")
        broadcast(socket, "game_over", %{})
      end
      {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
    rescue
      e in ArgumentError -> {:reply, {:error, %{reason: e.message}}, socket}
    end
  end

  defp authorized?(_payload) do
    true
  end
end
