import { Box, Button, Field, Flex, Heading, Image, Input, Stack, Text } from "@chakra-ui/react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorToast, SuccessToast } from "../components/ui/toaster";
import { db } from "../firebase";

function MyPage() {
  const [questionKind, setQuestionKind] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState({});

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

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    setUsername(storedUsername);
    setPassword(storedPassword);

    const scoreObject = localStorage.getItem("score");
    if (scoreObject === "undefined") return setScore(null);

    const storedScore = JSON.parse(localStorage.getItem("score"));
    setScore(storedScore);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    try {
      // ユーザー名で検索
      const userCollection = collection(db, "user");
      const q = query(userCollection, where("name", "==", username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.error("ユーザーが見つかりませんでした");
        return;
      }

      // 該当ドキュメントが見つかったらそのIDを取得
      const userDoc = snapshot.docs[0];
      const userRef = doc(db, "user", userDoc.id);

      // パスワードを更新
      await updateDoc(userRef, {
        password: data.password,
      });

      SuccessToast("更新完了", "パスワードを更新しました");
      localStorage.setItem("password", data.password);
    } catch (error) {
      console.error(error);
      ErrorToast("更新失敗", "パスワードの更新に失敗しました:");
    }
  });

  return (
    <>
      <Box w={"100%"} h={"100%"} minH={"100vh"}>
        <Stack alignItems={"center"} mt={10} w={"100%"}>
          <Heading size={"2xl"}>マイページ</Heading>

          <Stack alignItems={"flex-start"} w={"100%"} p={"0 14rem"} mt={16}>
            <Heading size={"xl"}>成績一覧</Heading>

            <Stack mt={4} gap={10}>
              {Object.entries(questionKind).map((icon) => (
                <Flex gap={4} key={icon[0]} alignItems={"center"}>
                  <Box>
                    <Image src={icon[1]} alt={`${icon[0]}のアイコン`} />
                  </Box>
                  {score && score[icon[0].toLowerCase()] ? (
                    <Text>{score[icon[0].toLowerCase()]} / 100</Text>
                  ) : (
                    <Text whiteSpace={"pre-wrap"}>{"未実施です。\n問題を解いてみましょう！"}</Text>
                  )}
                </Flex>
              ))}
            </Stack>
          </Stack>

          <Stack alignItems={"flex-start"} w={"100%"} p={"0 14rem"} mt={20}>
            <Heading size={"xl"}>ユーザー編集</Heading>

            <form onSubmit={onSubmit} style={{ width: "100%" }}>
              <Stack mt={4} gap={6} w={"100%"}>
                <Field.Root required invalid={!!errors.username} readOnly>
                  <Field.Label>ユーザー名</Field.Label>
                  <Input value={username} readOnly variant={"subtle"} />
                  <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root required invalid={!!errors.password}>
                  <Field.Label>
                    パスワード <Field.RequiredIndicator />
                  </Field.Label>
                  <Input {...register("password")} defaultValue={password} />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" backgroundColor={"var(--color-blue)"} mt={6}>
                  変更を保存
                </Button>
              </Stack>
            </form>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}

export default MyPage;
