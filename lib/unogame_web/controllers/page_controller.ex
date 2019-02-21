defmodule UnogameWeb.PageController do
  use UnogameWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def game(conn, params) do
    render(conn, "game.html", name: params["name"])
  end

  def join_game(conn, params) do
    path = "/game/" <> params["params"]["name"]
    redirect(conn, to: path)
  end
end
