defmodule UnogameWeb.Router do
  use UnogameWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", UnogameWeb do
    pipe_through :browser

    get "/", PageController, :index
    post "/", PageController, :join_game
    get "/game/:name", PageController, :game
  end

  # Other scopes may use custom stacks.
  # scope "/api", UnogameWeb do
  #   pipe_through :api
  # end
end
