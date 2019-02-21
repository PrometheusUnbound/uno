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

    this.channel = props.channel;

    this.playerid = props.playerid; 
    console.log("playerid: " + this.playerid);

    this.channel.on("game_ready", payload => {this.getGame()});
    this.channel.on("game_over", payload => {this.gameOver()});

    this.channel
        .join()
        .receive("ok", this.set_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) });
  }

  getGame() {
    this.channel.push("get_game", {})
      .receive("ok", (resp) => { this.setState(resp.game);
      console.log("get_game...");
      console.log(resp.game); });
  }

  gameOver() {
    alert("game over");
  }

  set_view(view) {
    console.log("Joined successfully");
    console.log(view.game);
    this.setState(view.game);
  }

  drawCard() {
    this.channel.push("draw_card", { playerid: this.playerid })
        .receive("ok", (resp) => { this.setState(resp.game); console.log(resp.game); })
        .receive("error", resp => { console.log("Unable to draw card", resp) }); 
  }

  playCard() {
    let card = this.state.player_hands[this.playerid][0];
    this.channel.push("play_card", { playerid: this.playerid, card: card})
        .receive("ok", (resp) => { this.setState(resp.game); console.log(resp.game); })
        .receive("error", resp => { console.log("Unable to play card", resp) }); 
  }

  render() {
    return <div>
        <h1>Hello World</h1>
        <button onClick={this.drawCard.bind(this)}>Draw</button>
        <button onClick={this.playCard.bind(this)}>Play card</button>
      </div>
  }

}
