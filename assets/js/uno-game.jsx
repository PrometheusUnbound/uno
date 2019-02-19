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
    this.state = {
      playerid: -1,
      hand: [],
      opp_hands: [],
      deck: [],
      face_up: [],
      turn: true,
    }

  this.channel = props.channel;

  this.channel
      .join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
  }

  on_play(ev){
    if turn {
      if (ev.target.value[0] == face_up[0]) ||
          (ev.target.value[1] == face_up[1]) ||
          (ev.target.value[0] == "W" ) ||
          (ev.target.value[0] == "W+4"){
        this.setState({turn: false})
        this.channel.push("play_card", { playerid: playerid },
        { card: ev.target.value })
        .receive("ok", this.got_view.bind(this));
      }
      else {
        alert("Not a legal play!");
      }
    }
    else {
      alert("Not your turn!");
    }
  }

  on_draw(ev){
    if turn {
      this.channel.push("draw_card", { playerid: playerid })
        .recieve("ok", this.got_view.bind(this));
    }
    else {
      alert("Not your turn!");
    }
  }




  render() {
    return <h1>Hello World</h1>
  }

}
