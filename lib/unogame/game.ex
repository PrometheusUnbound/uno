defmodule Unogame.Game do

  defp gen_color_cards(color) do 
    # from Uno wiki: each color consists of one 0, two of each 1-9, two of each 'skip', 'draw-2', and 'reverse'
    vals_to_dup = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw-2"]
    possible_values = ["0" | Enum.concat(vals_to_dup, vals_to_dup)]
    
    Enum.map(possible_values, fn val -> [color, val] end)
  end

  defp gen_special_cards() do
    # from Uno wiki: four of each "wild" and "draw-4-wild"
    wild_cards = List.duplicate(["wild", "wild"], 4)
    draw_4_cards = List.duplicate(["wild", "draw-4-wild"], 4)
    Enum.concat(wild_cards, draw_4_cards)
  end

  defp gen_all_cards() do
    # from Uno wiki: 108 cards total
    blue_cards = gen_color_cards("blue")
    green_cards = gen_color_cards("green")
    red_cards = gen_color_cards("red")
    yellow_cards = gen_color_cards("yellow")
    special_cards = gen_special_cards()


    Enum.concat(blue_cards, green_cards)
    |> Enum.concat(red_cards)
    |> Enum.concat(yellow_cards)
    |> Enum.concat(special_cards)
    |> Enum.shuffle
   
  end

  # cards are in the format of [color, value]
  def new do
    %{
      deck: gen_all_cards(),
      direction: 1, # 1 is forwards, -1 is backwards
      discard_pile: [],
      next_player_ind: 0,
      num_players: 0,
      player_hands: %{},
      player_ids: [1, 2, 3, 4], # TODO, update player_ids
      deck: gen_all_cards()
    }
  end

  # TODO pass in player id here?
  def client_view(game) do
    %{
      num_players: game.num_players,
      deck: game.deck, # TODO remove
      discard_pile: game.discard_pile, # TODO replace with top card in discard_pile,
      player_hands: game.player_hands,
      current_player_ind: game.next_player_ind # TODO remove
    }
  end

  defp deal_cards(game, []), do: game
  defp deal_cards(game, player_ids) do
    [head | tail] = player_ids
    hand = Enum.take(game.deck, 7)
    new_deck = Enum.take(game.deck, -(length(game.deck) - 7))
    new_player_hands = game.player_hands
    |> Map.put(head, hand)

    game = game
    |> Map.put(:deck, new_deck)
    |> Map.put(:player_hands, new_player_hands)
 
    deal_cards(game, tail)
  end 
  def deal_cards(game) do
    IO.puts("dealing cards...") # TODO delete
        
    game
    |> deal_cards(game.player_ids)
  end

  defp next_player_ind(game) do
    rem(game.next_player_ind + game.direction, length(game.player_ids))
  end

  defp next_turn(game) do
    IO.puts("to next player...")
    
    game
    |> Map.put(:next_player_ind, next_player_ind(game))
  end

  # shuffles the discard pile to the deck, leaving the top card in the discard pile
  defp discard_pile_to_deck(game) do
    IO.puts("shuffling...")
    [top_card | to_deck] = game.discard_pile
    shuffled_deck = to_deck
    |> Enum.shuffle

    game
    |> Map.put(:deck, shuffled_deck)
    |> Map.put(:discard_pile, [top_card])
  end
  defp draw_card_to_hand(game, playerid) do
    if game.deck == [] do
      game
      |> discard_pile_to_deck
      |> draw_card_to_hand(playerid)
    else
      [top_card | new_deck] = game.deck
      new_player_hand = [top_card | Map.get(game.player_hands, playerid)]

      new_player_hands = game.player_hands
      |> Map.put(playerid, new_player_hand)

      game
      |> Map.put(:deck, new_deck)
      |> Map.put(:player_hands, new_player_hands)
    end
  end
  def draw_card(game, playerid) do
    game
    |> draw_card_to_hand(playerid)
    |> next_turn
  end

  defp draw_two_played(game, playerid) do
    next_player_ind = next_player_ind(game)
    next_player_id = Enum.at(game.player_ids, next_player_ind)   

    game
    |> draw_card_to_hand(next_player_id)
    |> draw_card_to_hand(next_player_id)
  end

  defp reverse_played(game) do
    game
    |> Map.put(:direction, game.direction * -1)
  end

  defp skip_played(game) do
    game
    |> next_turn
  end

  # may be unnecessary? the card should already have the color updated? (eg: [blue, wild])
  defp wild_played(game, playerid, card) do
    # TODO  

    game
  end

  defp wild_draw_four_played(game, playerid, card) do
    next_player_ind = next_player_ind(game)
    next_player_id = Enum.at(game.player_ids, next_player_ind)

    game
    |> draw_card_to_hand(next_player_id)
    |> draw_card_to_hand(next_player_id)
    |> draw_card_to_hand(next_player_id)
    |> draw_card_to_hand(next_player_id)
    |> wild_played(playerid, card) 
  end

  defp move_from_hand_to_pile(game, playerid, card) do
    # TODO does this need validation for card is owned by player?
    player_hand = Map.get(game.player_hands, playerid)
    new_player_hand = player_hand
    |> List.delete(card)
  
    new_player_hands = game.player_hands
    |> Map.put(playerid, new_player_hand)

    new_pile = [card | game.discard_pile]

    game
    |> Map.put(:player_hands, new_player_hands)
    |> Map.put(:discard_pile, new_pile)
  end
  # for now, do not allow cards to stack (eg: deflecting draw-2 with draw-2)
  def play_card(game, playerid, card) do
    game = game
    |> move_from_hand_to_pile(playerid, card)

    case Enum.at(card, 1) do
      "draw-2" -> draw_two_played(game, playerid) |> next_turn
      "draw-4-wild" -> wild_draw_four_played(game, playerid, card) |> next_turn
      "reverse" -> reverse_played(game) |> next_turn
      "skip" -> skip_played(game) |> next_turn
      "wild" -> wild_played(game, playerid, card) |> next_turn
      _ -> game |> next_turn
    end
    # TODO handle last card -- game over? or player no longer active
  end

end