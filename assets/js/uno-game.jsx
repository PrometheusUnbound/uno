import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";

//Export default/channel set up
export default function game_init(root, channel, playerid) {
  ReactDOM.render(<UnoGame channel={channel} playerid={playerid} />, root);
}

class UnoGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerid: -1,
      player_hand: [],
      opp_hands: [],
      face_up_card: [],
    }

    this.channel = props.channel;

    this.playerid = props.playerid; 
    console.log("playerid: " + this.playerid);

    this.channel.on("game_ready", payload => {this.getGame()});
    this.channel.on("game_over", payload => {this.gameOver()});
    this.channel.on("update_game", payload => {this.getGame()});

    this.channel
        .join()
        .receive("ok", this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); this.isGameAlreadyInProgress = true; this.setState({}) });
  }

  getGame() {
    this.channel.push("get_game", { playerid: this.playerid })
      .receive("ok", (resp) => { this.setState(resp.game);
      console.log(resp.game); });
  }

  gameOver() {
    alert("game over");
  }

  got_view(view) {
    console.log("new view", view);
    console.log(view.game);
    this.setState(view.game);
  }

  on_play(ev){
    this.channel.push("play_card", { playerid: this.playerid },
    { card: ev.target.value })
        .receive("ok", this.got_view.bind(this));
  }

  on_draw(ev){
    console.log(ev);
    this.channel.push("draw_card", { playerid: this.playerid })
        .receive("ok", (resp) => { this.got_view(resp); console.log(resp.game); })
        .receive("error", resp => { console.log("Unable to draw card", resp) }); 
  }

  on_uno(){
    this.channel.push("uno?", { hand: hand })
      .recieve("ok", this.got_view.bind(this))
  }

  playCard(card) {
    this.channel.push("play_card", { playerid: this.playerid, card: card})
        .receive("ok", (resp) => { this.setState(resp.game); console.log(resp.game); })
        .receive("error", resp => { console.log("Unable to play card", resp) }); 
  }

  renderWaiting() {
    return (<div className="row">
        <h3>Waiting for more players to join...</h3>
      </div>);
  }

  renderGameAlreadyInProgress() {   
    return (<div>
        <h3>Game is already in progress...</h3>
        <br />
        <a href="/">Go back</a>
      </div>);
  }    

  createOpponentHands() {
    let opponentHands = [];
    let keys = Object.keys(this.state.opponent_cards);
    for (let i = 0; i < keys.length; i++) {
      let opponentId = keys[i];
      let numCardsLeft = this.state.opponent_cards[opponentId];
      opponentHands.push(<OpponentHand className="column opponent-hand" opponentid={opponentId} count={numCardsLeft} />);
    }
    return (<div className="opponent-hands">
        <b>Your opponents:</b>
        <br />
        <div className="row">
          {opponentHands}
        </div>
      </div>);

  }
       
  createHand() {
    let hand = [];
    for (let i = 0; i < this.state.player_hand.length; i++) {
      let card = this.state.player_hand[i];
      hand.push(<Card className="column card-hand" color={card[0]} value={card[1]} onClick={() => {this.playCard(card)}} />);
    }

    return (<div className="player-hand">
        <b>Your hand:</b>
        <br />
        <div className="row">
          {hand}
        </div>
      </div>); 
  }

  createTurnText() {
    if (this.state.is_player_turn) {
      return (<p>Your Turn!</p>);
    } else {
      return (<p>Opponent Turn</p>);
    }
  }

  render() {
    if (this.isGameAlreadyInProgress) {
      return this.renderGameAlreadyInProgress();
    } else if (!this.state.has_game_started) {
      return this.renderWaiting();
    }

    let turnText = <div>{this.createTurnText()}</div>
    let hand = this.createHand();
    let opponentHands = this.createOpponentHands();
    let faceUp = this.state.face_up_card.length != 0 ? <Card className="faceup" color={this.state.face_up_card[0]} value={this.state.face_up_card[1]} /> : [];
    let uno_button = <button className="button uno" onClick={() => this.on_uno()}>
                      UNO!</button>
    return (
      <div>
        {turnText}
        <div className="row">
          <div className="column">
            {faceUp}
          </div>
          <div className="column">
            <img id="deck" src='/images/UNO-Back.png'
                      onClick={this.on_draw.bind(this)} />
          </div>
        </div>
        {opponentHands}
        <div className="row">
          <div className="column">
            {uno_button}
          </div>
        </div>
        {hand}
      </div>
    )
  }
 
}

const Card = function(props) {
  return (<div className={props.className} onClick={props.onClick}>
      <p>{props.color + " " + props.value}</p>
    </div>);
}

const OpponentHand = function(props) {
  return (<div className={props.className}>
      <p><i>Player {props.opponentid + ": " + props.count}</i> cards left</p>
    </div>);
}
