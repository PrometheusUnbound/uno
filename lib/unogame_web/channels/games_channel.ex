defmodule UnogameWeb.GamesChannel do
  use UnogameWeb, :channel

  alias Unogame.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Game.new()
      |> Game.deal_cards

      socket = socket
      |> assign(:game, game)

      {:ok, %{"game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # TODO handle input
  def handle_in("draw_card", %{"playerid" => playerid}, socket) do
    game = Game.draw_card(socket.assigns[:game], playerid)
    socket = socket
    |> assign(:game, game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end
  # card should be in the format of [color, value]
  def handle_in("play_card", %{"playerid" => playerid, "card" => card}, socket) do
    game = Game.play_card(socket.assigns[:game], playerid, card)
    socket = socket
    |> assign(:game, game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  defp authorized?(_payload) do
    true
  end
end
