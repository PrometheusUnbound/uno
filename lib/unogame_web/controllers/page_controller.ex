defmodule UnogameWeb.PageController do
  use UnogameWeb, :controller

  def index(conn, _params) do
    # TODO change back to index
    render(conn, "game.html")
  end
end
