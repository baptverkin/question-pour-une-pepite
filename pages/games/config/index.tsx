import { getSession } from "@auth0/nextjs-auth0";
import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import React from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { Layout } from "../../../components/layout";
import { getDatabase } from "../../../src/database";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = getSession(req, res);
  const email = session?.user.email;

  const mongodb = await getDatabase();
  const response = await mongodb
    .db()
    .collection("users")
    .findOne({ email: email });

  const usersDb = JSON.parse(JSON.stringify(response));

  return {
    props: {
      _id: usersDb._id,
      pseudo: usersDb.pseudo,
    },
  };
};

const GameConfig: React.FC<{ _id: ObjectId; pseudo: string }> = ({
  _id,
  pseudo,
}) => {
  const [diff, setDiff] = React.useState("");
  const handleButtons = (e: any) => {
    console.log(e.target.value);
    setDiff(e.target.value);
  };
  return (
    <Layout>
      <div className="container">
        <h3>Configurer la partie :</h3>
        <label>Joueur 1 : </label> {pseudo}
        <br />
        <label>Joueur 2 : </label> IA Lucas
        <br />
        <label>Joueur 3 : </label> IA Bot Martin
        <br />
        <label>Joueur 4 : </label> IA Glados
        <br />
        <br />
        <h4>Choix de la difficulté : {diff} </h4>
        <ButtonGroup aria-label="Basic example">
          <Button variant="secondary" value="facile" onClick={handleButtons}>
            Facile
          </Button>
          <br />
          <Button variant="secondary" value="moyen" onClick={handleButtons}>
            Moyen
          </Button>
          <br />
          <Button variant="secondary" value="difficile" onClick={handleButtons}>
            Difficile
          </Button>
        </ButtonGroup>
        <br />
        <br />
        <br />
        <br />
        <Button>Lancer la partie &rarr;</Button>
      </div>
    </Layout>
  );
};

export default GameConfig;
