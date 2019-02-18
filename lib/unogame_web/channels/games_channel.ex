defmodule UnogameWeb.GamesChannel do
  use UnogameWeb, :channel

  alias UnogameWeb.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do

      {:ok, %{}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # TODO handle input

  defp authorized?(_payload) do
    true
  end
end
