import { getSession } from "@auth0/nextjs-auth0";
import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card, Nav, Button } from "react-bootstrap";
import { Layout } from "../components/layout";
import { getDatabase } from "../src/database";
import styles from "../styles/Home.module.css";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { v4 as uuidv4 } from "uuid";
import router from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = getSession(req, res);
  const email = session?.user.email;
  const mongodb = await getDatabase();

  const response = await mongodb
    .db()
    .collection("users")
    .findOne({ email: email });
  const userDb = JSON.parse(JSON.stringify(response));

  const responses = await mongodb.db().collection("users").find().toArray();
  const usersSorted = responses.sort(
    (a: any, b: any) => b.victories - a.victories
  );
  const usersDb = JSON.parse(JSON.stringify(usersSorted));
  console.log(responses.indexOf(userDb))
  return {
    props: {
      _id: userDb._id,
      pseudo: userDb.pseudo,
      victories: userDb.victories,
      playedGames: userDb.playedGames,
      email: userDb.email,
      leaderBoard: usersDb,
    },
  };
};

const Profile: React.FC<{
  _id: ObjectId;
  pseudo: string;
  victories: number;
  playedGames: number;
  email: string;
  leaderBoard: any;
}> = ({ _id, pseudo, victories, playedGames, email, leaderBoard }) => {
  const handleSubmit = async (e: {
    preventDefault: () => void;
    target: any;
  }) => {
    e.preventDefault();
    const temp = {
      _id: _id,
      pseudo: pseudo,
      email: email,
    };

    await fetch("/api/games/generateGameMulti", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(temp),
    }).then((result) => router.push(result.url));
  };
  const index = leaderBoard.map((element: any) => element._id).indexOf(_id);
  return (
    <>
      <Layout>
        <div className="container">
          <h2>
            Bonjour {pseudo}&nbsp;&nbsp;&nbsp;
            <Link href="/form" passHref>
              <Image
                className="edit-pseudo"
                src="/images/pencil-icon.png"
                alt="changer pseudo"
                width="20"
                height="20"
              />
            </Link>
          </h2>
          <ul>
            <h4>{playedGames} parties</h4>
            <h4>{victories} victoires</h4>
            <h4>Classement général : {index + 1} </h4>
          </ul>
        </div>
        <br />

        <h3 className={styles.title}>Choisis ton mode de jeu</h3>
        <br></br>
        <Card
          className="cardProfile"
          style={{
            // textAlign: "center",
            marginLeft: "100px",
            marginRight: "100px",
          }}
        >
          <Tabs defaultActiveKey="first">
            <Tab eventKey="first" title="Multi-joueur" className="container">
              <p style={{ marginBottom: "1em", marginTop: "1em" }}>
                <strong>Multi-joueur : </strong>
                Défie tes amis dans une partie multijoueur et devient le
                champion du 9 points gagnants
              </p>
            </Tab>
            <Tab eventKey="second" title="Entrainement" className="container">
              <p style={{ marginBottom: "1em", marginTop: "1em" }}>
                <strong>Entrainement : </strong>
                Défie des IAs et devient le champion du 9 points gagnants
              </p>
            </Tab>
            <Tab eventKey="third" title="Règles" className="container">
              <p style={{ marginBottom: "1em", marginTop: "1em" }}>
                <strong>Règles du jeu : </strong>
                Quatre candidats sont en lice et doivent répondre à des
                questions de culture générale. Le gagnant est le premier
                candidat qui arrive à 9 points
              </p>
            </Tab>
          </Tabs>
          <Link href="/games/config" passHref={true}>
            <Button
              variant="primary"
              style={{
                textAlign: "center",
                marginLeft: "40%",
                marginRight: "40%",
                marginBottom: "1em",
              }}
            >
              Jouer contre des IA &rarr;
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            style={{
              textAlign: "center",
              marginLeft: "40%",
              marginRight: "40%",
              marginBottom: "1em",
            }}
          >
            Jouer en multijoueur &rarr;
          </Button>
        </Card>
        <br></br>

        <h3 className={styles.title}>Entrainement</h3>
        <br></br>

        <div className="column">
          <div
            className="row"
            style={{
              textAlign: "center",
              marginLeft: "100px",
              marginRight: "100px",
              justifyContent: "center",
              marginBottom: "1em",
            }}
          >
            <Card style={{ width: "18rem" }}>
              <Card.Img variant="top" src="/images/neuf-points-gagnants.jpeg" />
              <Card.Body>
                <Card.Title>9 Points gagnants</Card.Title>
                <Card.Text>
                  Rapidité ! Les 3 premiers joueurs à obtenir 9 points se
                  qualifient
                </Card.Text>
                <Link href="/games/config/" passHref={true}>
                  <Button variant="primary">Commencez à jouer &rarr;</Button>
                </Link>
              </Card.Body>
            </Card>

            <Card style={{ width: "18rem" }}>
              <Card.Img variant="top" src="/images/quatreàlasuite.jpg" />
              <Card.Body>
                <Card.Title>4 à la suite </Card.Title>
                <Card.Text>
                  Celui qui répond aux plus de questions successivement se
                  qualifie
                </Card.Text>
                <Link href="#" passHref={true}>
                  <Button variant="primary">Commencez à jouer &rarr;</Button>
                </Link>
              </Card.Body>
            </Card>

            <Card style={{ width: "18rem" }}>
              <Card.Img variant="top" src="/images/faceàface.jpg" />
              <Card.Body>
                <Card.Title>Face à face</Card.Title>
                <Card.Text>Le premier à 12 points remporte la partie</Card.Text>
                <Link href="#" passHref={true}>
                  <Button variant="primary">Commencez à jouer &rarr;</Button>
                </Link>
              </Card.Body>
            </Card>
          </div>
        </div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">pseudo</th>
                <th scope="col">playedGames</th>
                <th scope="col">victories</th>
              </tr>
            </thead>
            <tbody>
                {leaderBoard.map((element: any, index: number) => (
                  <tr key={uuidv4()}>
                    <th scope="row">#{index + 1}</th>
                    <td>{element.pseudo}</td>
                    <td>{element.playedGames}</td>
                    <td>{element.victories}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </>
  );
};

export default Profile;
