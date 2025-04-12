import { Box, Button, Flex, Heading, RadioGroup, Stack, Text, Textarea } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

export const QuizPage = () => {
  const [progress, setProgress] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("quiz_progress");

    if (!stored) return;
    const data = JSON.parse(stored);
    setProgress(data);

    const fetchQuestion = async () => {
      const id = data.idList[data.currentIndex];
      const docRef = doc(db, data.lang.toLowerCase(), id);
      const snap = await getDoc(docRef);
      setQuestion(snap.data());
    };

    fetchQuestion();
  }, []);

  /**
   * 次へすすむ
   * @returns
   */
  const handleNext = async () => {
    if (!selectedAnswer) return;

    const updated = { ...progress };

    // 正誤判定
    const isCorrect = selectedAnswer === question.correct;
    // 結果保存（正誤）
    updated.results[updated.currentIndex] = isCorrect;

    updated.answers[updated.currentIndex] = selectedAnswer;
    updated.currentIndex += 1;

    if (updated.currentIndex >= updated.idList.length) {
      localStorage.setItem("quiz_progress", JSON.stringify(updated));
      setProgress(updated);
      navigate("/Result");
      return;
    }

    const nextId = updated.idList[updated.currentIndex];
    const nextRef = doc(db, updated.lang.toLowerCase(), nextId);
    const nextSnap = await getDoc(nextRef);
    const nextQuestion = nextSnap.data();

    setSelectedAnswer("");
    localStorage.setItem("quiz_progress", JSON.stringify(updated));
    setProgress(updated);
    setQuestion(nextQuestion);
  };

  const handlePrevious = async () => {
    if (progress.currentIndex <= 0) return;

    const updated = { ...progress };
    updated.currentIndex -= 1;

    const prevId = updated.idList[updated.currentIndex];
    const prevRef = doc(db, updated.lang.toLowerCase(), prevId);
    const prevSnap = await getDoc(prevRef);
    const prevQuestion = prevSnap.data();

    setSelectedAnswer(updated.answers[updated.currentIndex] || "");
    localStorage.setItem("quiz_progress", JSON.stringify(updated));
    setProgress(updated);
    setQuestion(prevQuestion);
  };

  if (!question || !progress) return <div>読み込み中...</div>;

  return (
    <Box w="100%" h="100%" minH="100vh" maxW="1000px">
      <Box p={"0rem 8rem"}>
        <Heading mt={8} textAlign={"center"}>
          {progress.lang}
        </Heading>
        <Heading textAlign={"center"} mt={6}>
          {progress.currentIndex + 1} / {progress.idList.length}
        </Heading>

        <Flex gap={6} mt={16}>
          <Text>Q.</Text>
          <Text>{question.question}</Text>
        </Flex>

        <Flex gap={6} mt={12}>
          <Text>A.</Text>
          {typeof question.choices === "object" ? (
            <RadioGroup.Root value={selectedAnswer} onValueChange={(e) => setSelectedAnswer(e.value)}>
              <Stack gap={10}>
                {question.choices.map((choice) => (
                  <RadioGroup.Item key={choice} value={choice} alignItems={"flex-start"}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText fontSize={"md"}>{choice}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          ) : (
            <Textarea onChange={(e) => setSelectedAnswer(e.target.value)} />
          )}
        </Flex>

        <Flex justifyContent={"space-between"} mt={20} p={"0 8rem"}>
          <Button
            onClick={handlePrevious}
            border={"1px solid var(--color-blue)"}
            backgroundColor={"var(--color-white)"}
            color={"var(--color-blue)"}
          >
            前の問題へ
          </Button>
          <Button onClick={handleNext} backgroundColor={"var(--color-blue)"}>
            次の問題へ
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
