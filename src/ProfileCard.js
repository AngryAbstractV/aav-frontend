import React from "react";
import "./ProfileCard.css";

function ProfileCard(props) {
    return (
        <div style={{paddingBottom: 30}}>
            <header>
                <img src={props.img} alt={props.name} />
            </header>
            <h1 className="bold-text">
                {props.name} <span className="normal-text">{props.age}</span>
            </h1>
            <div className="social-container">
                <a href={props.github}>Github</a>
                <br/>
                <a href={props.linkedIn}>LinkedIn</a>
            </div>
        </div>
    );
}

export default ProfileCard;