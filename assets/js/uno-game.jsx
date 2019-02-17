import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";

//Export default/channel set up
export default function game_init(root, channel) {
  ReactDOM.render(<UnoGame channel={channel} />, root);
}

class UnoGame extends React.Component {
  constructor(props) {
    super(props);

    this.channel = props.channel;

    this.channel
        .join()
        .receive("ok", this.set_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) });
  }

  set_view(view) {
    console.log("Joined successfully");
    console.log(view.game);
    this.setState(view.game);
  }

  drawCard() {
    this.channel.push("draw_card", { playerid: 1 })
        .receive("ok", (resp) => { this.setState(resp.game); 
      console.log("draw_card...");
      console.log(resp.game); });
  }

  playCard() {
    let card = this.state.player_hands[1][0];
    console.log("player hands...");
    console.log(this.state.player_hands[1]);
    this.channel.push("play_card", { playerid: 1, card: card})
        .receive("ok", (resp) => { this.setState(resp.game); console.log(resp.game); });
  }

  render() {
    return <div>
        <h1>Hello World</h1>
        <button onClick={this.drawCard.bind(this)}>Draw</button>
        <button onClick={this.playCard.bind(this)}>Play card</button>
      </div>
  }

}
