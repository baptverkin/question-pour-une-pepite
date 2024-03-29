import type { GetServerSideProps, NextPage } from "next";
import { Layout } from "../../../../components/layout";
import styles from "../../../../styles/Home.module.css";
import { getDatabase } from "../../../../src/database";
import { getSession } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";
import router from "next/router";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Pusher from "pusher-js";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = getSession(req, res);
  const email = session?.user.email;
  const gameIdTest = query.game_id?.toString();
  let questionNumber;
  if (query.num !== undefined) {
    questionNumber = query.num;
  }
  const questionNumberParse = JSON.parse(JSON.stringify(questionNumber));

  const APP_KEY = process.env.APP_KEY;
  const APP_CLUSTER = process.env.APP_CLUSTER;

  const mongodb = await getDatabase();

  const response = await mongodb
    .db()
    .collection("users")
    .findOne({ email: email });
  const userDB = JSON.parse(JSON.stringify(response));

  const questionsList = await mongodb
    .db()
    .collection("9-points-gagnants")
    .find()
    .toArray();
  const questionTest = JSON.parse(JSON.stringify(questionsList));

  const findCurrentGame = await mongodb
    .db()
    .collection("current-games")
    .findOne({ _id: new ObjectId(gameIdTest) });

  const currentGame = JSON.parse(JSON.stringify(findCurrentGame));
  const players = currentGame?.players;
  const findGameId = currentGame?._id;

  const findGameIdplayer2 = currentGame?.players.player2._id;
  const findGameIdplayer3 = currentGame?.players.player3._id;
  const findGameIdplayer4 = currentGame?.players.player4._id;
  const findNumeroManche = currentGame?.neufPointsGagnants.length;

  const pointsBDDPlayer1 = currentGame?.players.player1.score9PtsGagnant;
  console.log("pointsBDDPlayer1", pointsBDDPlayer1);
  const pointsBDDPlayer2 = currentGame?.players.player2.score9PtsGagnant;
  const pointsBDDPlayer3 = currentGame?.players.player3.score9PtsGagnant;
  const pointsBDDPlayer4 = currentGame?.players.player4.score9PtsGagnant;

  const gameId = JSON.parse(JSON.stringify(findGameId));
  const gameIdPlayer2 = JSON.parse(JSON.stringify(findGameIdplayer2));
  const gameIdPlayer3 = JSON.parse(JSON.stringify(findGameIdplayer3));
  const gameIdPlayer4 = JSON.parse(JSON.stringify(findGameIdplayer4));
  const numeroManche = JSON.parse(JSON.stringify(findNumeroManche));

  return {
    props: {
      userDB: userDB,
      finish: currentGame?.finished,
      gameId: gameId,
      gameIdPlayer2: gameIdPlayer2,
      gameIdPlayer3: gameIdPlayer3,
      gameIdPlayer4: gameIdPlayer4,
      players: players,
      questionTest: questionTest,
      numeroManche: numeroManche,
      questionNumber: questionNumberParse,
      appKey: APP_KEY,
      cluster: APP_CLUSTER,
      pointsBDDPlayer1: pointsBDDPlayer1,
      pointsBDDPlayer2: pointsBDDPlayer2,
      pointsBDDPlayer3: pointsBDDPlayer3,
      pointsBDDPlayer4: pointsBDDPlayer4,
    },
  };
};

const Game1: React.FC<{
  userDB: any;
  finished: boolean;
  gameId: ObjectId;
  gameIdPlayer2: ObjectId;
  gameIdPlayer3: ObjectId;
  gameIdPlayer4: ObjectId;
  players: any;
  questionTest: any;
  numeroManche: number;
  questionNumber: number;
  appKey: string;
  cluster: string;
  pointsBDDPlayer1: number;
  pointsBDDPlayer2: number;
  pointsBDDPlayer3: number;
  pointsBDDPlayer4: number;
}> = ({
  userDB,
  finished,
  gameId,
  gameIdPlayer2,
  gameIdPlayer3,
  gameIdPlayer4,
  players,
  questionTest,
  numeroManche,
  questionNumber,
  appKey,
  cluster,
  pointsBDDPlayer1,
  pointsBDDPlayer2,
  pointsBDDPlayer3,
  pointsBDDPlayer4,
}) => {
  const maxTimer = 30;

  const [timer, setTimer] = useState(maxTimer);
  const [isDone, setIsDone] = useState(false);
  const [disableTime, setDisableTime] = useState(false);
  const [disableTrue, setDisableTrue] = useState(false);
  const [disableWrong, setDisableWrong] = useState(false);
  const [answers, setAnswers] = useState([""]);
  const [goodAnswer, setGoodAnswer] = useState("");
  const [points, setPoints] = useState(0);
  const [player1Points, setPlayer1Points] = useState(pointsBDDPlayer1);
  const [player2Points, setPlayer2Points] = useState(pointsBDDPlayer2);
  const [player3Points, setPlayer3Points] = useState(pointsBDDPlayer3);
  const [player4Points, setPlayer4Points] = useState(pointsBDDPlayer4);
  const [questionId, setQuestionId] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [questionArray, setQuestionArray] = useState(questionTest);
  const [question, setQuestion] = useState(questionNumber);
  const [winnerPlayer1, setWinnerPlayer1] = useState(false);
  const [winnerPlayer2, setWinnerPlayer2] = useState(false);
  const [winnerPlayer3, setWinnerPlayer3] = useState(false);
  const [winnerPlayer4, setWinnerPlayer4] = useState(false);
  const [messageWinnerPlayer1, setMessageWinnerPlayer1] = useState("");
  const [messageWinnerPlayer2, setMessageWinnerPlayer2] = useState("");
  const [messageWinnerPlayer3, setMessageWinnerPlayer3] = useState("");
  const [messageWinnerPlayer4, setMessageWinnerPlayer4] = useState("");
  const [pointsFlag, setPointsFlag] = useState(false);

  const bodyData = {
    gameId: gameId,
    _id: userDB._id,
    gameIdPlayer2: gameIdPlayer2,
    gameIdPlayer3: gameIdPlayer3,
    gameIdPlayer4: gameIdPlayer4,
    questionPoints: points,
    pseudo1: players.player1.pseudo,
    pseudo2: players.player2.pseudo,
    pseudo3: players.player3.pseudo,
    pseudo4: players.player4.pseudo,
    questionId: questionId,
    goodAnswer: goodAnswer,
    timer: timer,
  };

  useEffect(() => {
    const pusher = new Pusher(`${appKey}`, {
      cluster: `${cluster}`,
    });
    const channel = pusher.subscribe("tests");
    console.log("Channel 158", { channel });
    if (channel) {
      channel.bind(
        "answerCorrectly",
        (data: {
          clickedResponse: never;
          pseudo: never;
          points: number;
          player1Score: number;
        }) => {
          setDisableTrue(true);
          setPlayer1Points(data.player1Score);
          showResult(true, data.pseudo, data.clickedResponse, data.points);
        }
      );
      channel.bind(
        "answerIncorrectly",
        (data: { clickedResponse: never; pseudo: never }) => {
          console.log("bind answer incorrectly line 195");
          showResult(false, data.pseudo, data.clickedResponse, points);
          // setDisableWrong(true);
        }
      );
      channel.bind(
        "nextManche",
        (data: { nextQuestionIndex: never; previousQuestionID: never }) => {
          console.log("bind answer next manche line 203");
          setQuestionArray(
            questionArray.filter(
              (question: any) => question._id !== data.previousQuestionID
            )
          );
          setQuestion(data.nextQuestionIndex);
          setTimer(30);
          setIsDone(false);
          setDisableTime(false);
          setDisableTrue(false);
          setDisableWrong(false);
          setMessage("");
          setResponse("");
        }
      );
    }
    return () => {
      // clearTimeout(timer1);
      channel.unbind("answerCorrectly");
      channel.unbind("answerIncorrectly");
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const timer1 = setTimeout(() => setTimer(timer - 1), 1000);

      const arrAnswers = [
        ...questionArray[question].responses,
        questionArray[question].goodAnswer,
      ];

      if (timer === maxTimer) {
        setAnswers(arrAnswers.sort(() => Math.random() - 0.5));
        console.log("Points BDD", questionArray[question].points);
        setPoints(questionArray[question].points);
        setGoodAnswer(questionArray[question].goodAnswer);
        setQuestionId(questionArray[question]._id);
      }

      return () => {
        clearTimeout(timer1);
      };
    } else if (timer <= 0 || disableTrue === true) {
      setIsDone(true);
      setDisableTime(true);
    }
  }, [timer, isDone]);

  function handleResponse(clickedResponse: string) {
    const pointsPlayers = {
      player1: player1Points,
      player2: player2Points,
      player3: player3Points,
      player4: player4Points,
    };
    if (players.player1._id === userDB._id) {
      const bodyDataPlayer1 = {
        ...bodyData,
        pseudo: bodyData.pseudo1,
        clickedResponse: clickedResponse,
        ...pointsPlayers,
      };
      if (clickedResponse === goodAnswer) {
        bodyDataPlayer1.player1 += bodyData.questionPoints;

        fetch("/api/handle-answer-player1/good-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer1),
        });
      } else {
        fetch("/api/handle-answer-player1/wrong-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer1),
        });
      }
    } else if (players.player2._id === userDB._id) {
      const bodyDataPlayer2 = {
        ...bodyData,
        pseudo: bodyData.pseudo2,
        clickedResponse: clickedResponse,
        ...pointsPlayers,
      };
      if (clickedResponse === goodAnswer) {
        bodyDataPlayer2.player2 += bodyData.questionPoints;

        fetch("/api/handle-answer-player2/good-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer2),
        });
      } else {
        fetch("/api/handle-answer-player2/wrong-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer2),
        });
      }
    } else if (players.player3._id === userDB._id) {
      const bodyDataPlayer3 = {
        ...bodyData,
        pseudo: bodyData.pseudo3,
        clickedResponse: clickedResponse,
        ...pointsPlayers,
      };
      if (clickedResponse === goodAnswer) {
        bodyDataPlayer3.player3 += bodyData.questionPoints;

        fetch("/api/handle-answer-player3/good-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer3),
        });
      } else {
        fetch("/api/handle-answer-player3/wrong-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer3),
        });
      }
    } else if (players.player4._id === userDB._id) {
      const bodyDataPlayer4 = {
        ...bodyData,
        pseudo: bodyData.pseudo4,
        clickedResponse: clickedResponse,
        ...pointsPlayers,
      };
      if (clickedResponse === goodAnswer) {
        bodyDataPlayer4.player4 += bodyData.questionPoints;

        fetch("/api/handle-answer-player4/good-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer4),
        });
      } else {
        fetch("/api/handle-answer-player4/wrong-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyDataPlayer4),
        });
      }
    }
  }

  function showResult(
    isThatAGoodResponse: boolean,
    pseudo: string,
    goodAnswer: string,
    points: number
  ) {
    if (isThatAGoodResponse) {
      setMessage(
        `Félicitations ${pseudo} ! La bonne réponse est ${goodAnswer}. Vous avez gagné ${points} points`
      );
    } else {
      setMessage(`${pseudo} a choisi une mauvaise réponse !`);
    }
  }

  function endOfManche(questionNumber = null): any {
    const previousQuestionID = questionArray[question]._id;
    const newQuestionArray = questionArray.filter((e: any) => {
      return e.question !== questionArray[question].question;
    });

    const newQuestionIndex = Math.floor(
      Math.random() * newQuestionArray.length
    );
    console.log("New question index :", newQuestionIndex);
    // setQuestionArray(newQuestionArray);

    if (player1Points >= 9) {
      setWinnerPlayer1(true);
      setMessageWinnerPlayer1(
        `Félicitations ${players.player1.pseudo}, Vous avez gagné la partie !`
      );
      fetch("/api/handle-end-of-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
    } else if (player2Points >= 9) {
      setWinnerPlayer2(true);
      setMessageWinnerPlayer2(
        `Félicitations ${players.player2.pseudo}, Vous avez gagné la partie !`
      );
      fetch("/api/handle-end-of-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
    } else if (player3Points >= 9) {
      setWinnerPlayer3(true);
      setMessageWinnerPlayer3(
        `Félicitations ${players.player3.pseudo}, Vous avez gagné la partie !`
      );
      fetch("/api/handle-end-of-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
    } else if (player4Points >= 9) {
      setWinnerPlayer4(true);
      setMessageWinnerPlayer4(
        `Félicitations ${players.player4.pseudo}, Vous avez gagné la partie !`
      );
      fetch("/api/handle-end-of-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
    } else {
      fetch(
        `/api/games/generateMancheMulti?num=${newQuestionIndex}&previousQuestionIDd=${previousQuestionID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );
    }
  }

  return (
    <Layout>
      <div
        className={styles.title}
        style={{ marginTop: "30px", color: "gold" }}
      >
        {" "}
        9 points gagnants
      </div>
      <br />
      {winnerPlayer1 ? (
        <div
          className={styles.title}
          style={{ marginBottom: "5em", marginTop: "2em" }}
        >
          🎉{messageWinnerPlayer1}🎉
          <br></br>
          <br />
          {players.player1.pseudo}: {player1Points}
          &nbsp;&nbsp;&nbsp;
          {players.player2.pseudo}: {player2Points}
          &nbsp;&nbsp;&nbsp;
          {players.player3.pseudo}: {player3Points}
          &nbsp;&nbsp;&nbsp;
          {players.player4.pseudo}: {player4Points}
          <br></br>
          <br />
          <Link href="/profile" passHref>
            <button
              type="button"
              className="btn btn-warning"
              style={{ color: "white" }}
            >
              Retour au profil &rarr;
            </button>
          </Link>
        </div>
      ) : winnerPlayer2 ? (
        <div
          className={styles.title}
          style={{ marginBottom: "5em", marginTop: "2em" }}
        >
          🎉{messageWinnerPlayer2}🎉
          <br></br>
          <br />
          {players.player1.pseudo}: {player1Points}
          &nbsp;&nbsp;&nbsp;
          {players.player2.pseudo}: {player2Points}
          &nbsp;&nbsp;&nbsp;
          {players.player3.pseudo}: {player3Points}
          &nbsp;&nbsp;&nbsp;
          {players.player4.pseudo}: {player4Points}
          <br></br>
          <br />
          <Link href="/profile" passHref>
            <button
              type="button"
              className="btn btn-warning"
              style={{ color: "white" }}
            >
              Retour au profil &rarr;
            </button>
          </Link>
        </div>
      ) : winnerPlayer3 ? (
        <div
          className={styles.title}
          style={{ marginBottom: "5em", marginTop: "2em" }}
        >
          🎉{messageWinnerPlayer3}🎉
          <br></br>
          <br />
          {players.player1.pseudo}: {player1Points}
          &nbsp;&nbsp;&nbsp;
          {players.player2.pseudo}: {player2Points}
          &nbsp;&nbsp;&nbsp;
          {players.player3.pseudo}: {player3Points}
          &nbsp;&nbsp;&nbsp;
          {players.player4.pseudo}: {player4Points}
          <br></br>
          <br />
          <Link href="/profile" passHref>
            <button
              type="button"
              className="btn btn-warning"
              style={{ color: "white" }}
            >
              Retour au profil &rarr;
            </button>
          </Link>
        </div>
      ) : winnerPlayer4 ? (
        <div
          className={styles.title}
          style={{ marginBottom: "5em", marginTop: "2em" }}
        >
          🎉{messageWinnerPlayer4}🎉
          <br></br>
          <br />
          {players.player1.pseudo}: {player1Points}
          &nbsp;&nbsp;&nbsp;
          {players.player2.pseudo}: {player2Points}
          &nbsp;&nbsp;&nbsp;
          {players.player3.pseudo}: {player3Points}
          &nbsp;&nbsp;&nbsp;
          {players.player4.pseudo}: {player4Points}
          <br></br>
          <br />
          <Link href="/profile" passHref>
            <button
              type="button"
              className="btn btn-warning"
              style={{ color: "white" }}
            >
              Retour au profil &rarr;
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bubble" contentEditable>
            {" "}
            {questionArray[question].question}
          </div>
          {disableTrue ? (
            <></>
          ) : (
            <div style={{ marginLeft: "5%", fontSize: "50px" }}>{timer}</div>
          )}
          <div style={{ marginLeft: "20px" }}>{message}</div> <br></br>
          <div className="container">
            <div className="row">
              <div className="column">
                {" "}
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[0]);
                    handleResponse(answers[0]);
                  }}
                >
                  {answers[0]}
                </button>
              </div>
              <div className="column">
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[1]);
                    handleResponse(answers[1]);
                  }}
                >
                  {answers[1]}
                </button>
              </div>
            </div>
            <div className="row">
              <div className="column">
                {" "}
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[2]);
                    handleResponse(answers[2]);
                  }}
                >
                  {answers[2]}
                </button>
              </div>
              <div className="column">
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[3]);
                    handleResponse(answers[3]);
                  }}
                >
                  {answers[3]}
                </button>
              </div>
            </div>
            <div className="row">
              <div className="column">
                {" "}
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[4]);
                    handleResponse(answers[4]);
                  }}
                >
                  {answers[4]}
                </button>
              </div>
              <div className="column">
                <button
                  className="button button2"
                  disabled={disableTrue || disableWrong || disableTime}
                  onClick={() => {
                    setResponse(answers[5]);
                    handleResponse(answers[5]);
                  }}
                >
                  {answers[5]}
                </button>
              </div>
            </div>
            <br></br>
            <div>
              {players.player1.pseudo}: {player1Points}
              &nbsp;&nbsp;&nbsp;
              {players.player2.pseudo}: {player2Points}
              &nbsp;&nbsp;&nbsp;
              {players.player3.pseudo}: {player3Points}
              &nbsp;&nbsp;&nbsp;
              {players.player4.pseudo}: {player4Points}
            </div>{" "}
            <br></br>
            <div>
              <div
                // type="button"
                className="btn btn-warning"
                style={{ color: "white" }}
                onClick={() => endOfManche()}
              >
                Question suivante &rarr;
              </div>
            </div>
            <br></br>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Game1;
