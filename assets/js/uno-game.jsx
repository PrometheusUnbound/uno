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
      console.log("get_game...");
      console.log(resp.game); });
  }

  gameOver() {
    alert("game over");
  }

  got_view(view) {
    console.log("new view", view);
    console.log("Joined successfully");
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
    //let card = this.state.player_hands[this.playerid][0];
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
       
  createHand() {
/*    let table = [];
    for(let i = 0; j < 1; j++){
      let children = [];
      for(let j = 0; i < hand.length; j++) {
        children.push(<td>{'${hand[j][0] + " " + hand[j][1]'}</td>);
      }
      table.push(<tr>{children}</tr>);
    }
    return table;*/

    let hand = [];
    for (let i = 0; i < this.state.player_hand.length; i++) {
      console.log("render card...");
      let card = this.state.player_hand[i];
      hand.push(<Card className="column card-hand" color={card[0]} value={card[1]} onClick={() => {this.playCard(card)}} />);
    }

    return (<div className="hand">
        <b>Your hand:</b>
        <br />
        <div className="row">
          {hand}
        </div>
      </div>); 
  }

  render() {

    if (this.isGameAlreadyInProgress) {
      return this.renderGameAlreadyInProgress();
    } else if (!this.state.has_game_started) {
      return this.renderWaiting();
    }

    let hand = this.createHand();
    let faceUp = this.state.face_up_card.length != 0 ? <Card className="faceup" color={this.state.face_up_card[0]} value={this.state.face_up_card[1]} /> : [];
    let uno_button = <button className="button uno" onClick={() => this.on_uno()}>
                      UNO!</button>
    return (
      <div>
        <div className="row">
          <div className="column">
            {uno_button}
          </div>
        </div>
        <div className="row">
          <div className="column">
            {faceUp}
          </div>
          <div className="column">
            <img id="deck" src='/images/UNO-Back.png'
                      onClick={this.on_draw.bind(this)} />
          </div>
        </div>
        {hand}
      </div>
    )
  }
 
}

function Face(params) {
  let {face} = params;
  return (
    <div>
      <p><b>The Deck</b></p>
    </div>
  );
}

const Card = function(props) {
  return <div className={props.className} onClick={props.onClick}>
      {props.color + " " + props.value}
    </div>
}
