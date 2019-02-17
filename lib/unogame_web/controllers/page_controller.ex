defmodule UnogameWeb.PageController do
  use UnogameWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
