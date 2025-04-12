import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Fieldset,
  Flex,
  For,
  Heading,
  HStack,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, doc, getCountFromServer, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../firebase";

export const Setting = () => {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  // 格納しているデータ数
  const [questionCountArray, setQuestionCountArray] = useState([]);
  const [questionKind, setQuestionKind] = useState([]);

  const [selectedFormat, setSelectedFormat] = useState("order"); // 出題形式
  const [selectedFields, setSelectedFields] = useState([]); // 出題分野（複数）
  const [selectedDataCount, setSelectedDataCount] = useState(""); // 問題数

  useEffect(() => {
    const getQuestionCount = async () => {
      const questionCollection = collection(db, lang.toLowerCase());
      const questionSnapshots = await getCountFromServer(questionCollection);

      const count = questionSnapshots.data().count;
      const result = [];
      for (let i = 10; i < count; i += 10) {
        result.push(i);
      }

      result.push(count);
      setQuestionCountArray(result);

      const questionKindCollectionRef = doc(db, "field", lang.toLocaleLowerCase());
      const questionKindData = await getDoc(questionKindCollectionRef);
      const questionKind = Object.values(questionKindData.data());

      // 並び替え
      const sortedKinds = questionKind.sort((a, b) => {
        const getNumber = (str) => parseInt(str.replace(/[^0-9]/g, ""), 10);
        return getNumber(a) - getNumber(b);
      });

      localStorage.removeItem("quiz_progress");
      setQuestionKind(sortedKinds);
    };

    getQuestionCount();
  }, [lang]);

  const navigate = useNavigate();
  const handleStart = async () => {
    const q = query(collection(db, lang.toLowerCase()), where("field", "in", selectedFields));
    const querySnapshot = await getDocs(q);
    let docs = querySnapshot.docs;

    // ランダム選択の場合は、中身をシャッフルする
    if (selectedFormat.value === "random") {
      docs = [...docs].sort(() => Math.random() - 0.5);
    }

    const selectedDocs = docs.slice(0, selectedDataCount);
    const selectedIds = selectedDocs.map((doc) => doc.id);
    const fields = selectedDocs.map((doc) => doc.data().field); // 各問題の分野を抽出

    const progress = {
      idList: selectedIds,
      currentIndex: 0,
      answers: new Array(selectedIds.length).fill(null),
      lang,
      fields: fields,
      results: [],
    };

    localStorage.setItem("quiz_progress", JSON.stringify(progress));
    navigate("/Quiz");
  };

  const handleCheck = (e, value) => {
    const result = [...selectedFields];
    if (e.checked) {
      result.push(value);
      setSelectedFields(result);
    } else {
      const newCheck = result.filter((data) => data !== value);
      setSelectedFields(newCheck);
    }
  };

  return (
    <Box w="100%" h="100%" minH="100vh" maxW="1000px">
      <Heading size={"2xl"} textAlign={"center"} mt={10}>
        出題設定
      </Heading>

      <Box pl={40} pr={40} mt={20}>
        <Stack gap={14}>
          <Stack>
            <Text borderLeft={"10px solid var(--color-blue)"} pl={3} fontSize={"xl"} fontWeight={"bold"}>
              出題
            </Text>
            <Text pl={6} fontSize={"2xl"} fontWeight={"bold"} letterSpacing={3}>
              {lang}
            </Text>
          </Stack>

          <Stack>
            <Text borderLeft={"10px solid var(--color-blue)"} pl={3} fontSize={"xl"} fontWeight={"bold"}>
              出題形式
            </Text>
            <RadioGroup.Root mt={4} onValueChange={setSelectedFormat} defaultValue={"order"}>
              <HStack gap={10}>
                <RadioGroup.Item key="order" value="order">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText fontSize={"md"}>順番に出題</RadioGroup.ItemText>
                </RadioGroup.Item>
                <RadioGroup.Item key="random" value="random">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText fontSize={"md"}>ランダムに出題</RadioGroup.ItemText>
                </RadioGroup.Item>
              </HStack>
            </RadioGroup.Root>
          </Stack>

          <Stack>
            <Text borderLeft={"10px solid var(--color-blue)"} pl={3} fontSize={"xl"} fontWeight={"bold"}>
              出題分野
            </Text>

            <HStack gap={10} flexWrap={"wrap"} mt={4}>
              <Fieldset.Root>
                <CheckboxGroup defaultValue={questionKind[0]} name="questionKind">
                  <Fieldset.Content>
                    <For each={questionKind}>
                      {(value) => (
                        <Checkbox.Root
                          key={value}
                          value={value}
                          checked={selectedFields}
                          onCheckedChange={(e) => handleCheck(e, value)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>{value}</Checkbox.Label>
                        </Checkbox.Root>
                      )}
                    </For>
                  </Fieldset.Content>
                </CheckboxGroup>
              </Fieldset.Root>
            </HStack>
          </Stack>

          <Stack>
            <Text borderLeft={"10px solid var(--color-blue)"} pl={3} fontSize={"xl"} fontWeight={"bold"}>
              問題数
            </Text>

            <Box mt={4}>
              <select
                name="data-count"
                id="pet-select"
                value={selectedDataCount}
                onChange={(e) => setSelectedDataCount(Number(e.target.value))}
                style={{ border: "1px solid", padding: "1rem", borderRadius: "6px" }}
              >
                <option value="" hidden>
                  問題数を選んでください
                </option>
                {questionCountArray.map((questionCount, index) => (
                  <option key={index}>{questionCount}</option>
                ))}
              </select>
            </Box>
          </Stack>
        </Stack>

        <Flex mt={16} justifyContent={"center"}>
          <Button
            type="button"
            bgColor={"var(--color-blue)"}
            border={"1px solid var(--color-blue)"}
            p={2}
            pl={8}
            pr={8}
            onClick={handleStart}
          >
            スタート
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
