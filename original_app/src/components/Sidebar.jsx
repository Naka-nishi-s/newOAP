import { Box, Button, Card, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";

export const Sidebar = () => {
  const [questionKind, setQuestionKind] = useState({});

  useEffect(() => {
    const getQuestionKind = async () => {
      const questionKindCollection = collection(db, "question-kind");
      const questionSnapshots = await getDocs(questionKindCollection);
      const questionKinds = questionSnapshots.docs.map((doc) => doc.data());

      const newQuestionKind = {};
      questionKinds.forEach((questionKind) => {
        newQuestionKind[questionKind.name] = questionKind.img_src;
      });

      setQuestionKind(newQuestionKind);
    };

    getQuestionKind();
  }, []);

  const navigate = useNavigate();
  const transitionToLogin = () => {
    navigate("/Login");
  };

  const transitionToMypage = () => {
    navigate("/Mypage");
  };

  const transitionToRegister = () => {
    navigate("/Register");
  };

  const { isLoggedIn, logout } = useAuth();

  return (
    <Box w={"40rem"} backgroundColor={"var(--color-gray)"}>
      <Stack>
        <Flex justifyContent={"center"} gap={8} mt={16}>
          <Button
            variant={"solid"}
            backgroundColor={"var(--color-blue)"}
            p={2}
            pl={8}
            pr={8}
            onClick={isLoggedIn ? transitionToMypage : transitionToLogin}
          >
            {isLoggedIn ? "マイページ" : "ログイン"}
          </Button>
          <Button
            variant={"outline"}
            color={"var(--color-blue)"}
            border={"1px solid var(--color-blue)"}
            p={2}
            pl={8}
            pr={8}
            onClick={isLoggedIn ? logout : transitionToRegister}
          >
            {isLoggedIn ? "ログアウト" : "登 録"}
          </Button>
        </Flex>

        <Flex mt={20} flexDirection={"column"} alignItems={"center"}>
          <Card.Root width="320px" variant={"elevated"}>
            <Card.Header>
              <Card.Title mt={2} mb="2" textAlign={"center"} fontSize={"lg"}>
                問題集をえらぶ
              </Card.Title>
            </Card.Header>
            <Card.Body gap={4} pb={20}>
              {Object.entries(questionKind).map((icon) => (
                <Link to={`/Setting?lang=${icon[0]}`} key={icon[0]}>
                  <Flex gap={4} alignItems={"center"} ml={20}>
                    <Box>
                      <Image src={icon[1]} alt={`${icon[0]}のアイコン`} />
                    </Box>
                    <Text>{icon[0]}</Text>
                  </Flex>
                </Link>
              ))}
            </Card.Body>
          </Card.Root>
        </Flex>
      </Stack>
    </Box>
  );
};
