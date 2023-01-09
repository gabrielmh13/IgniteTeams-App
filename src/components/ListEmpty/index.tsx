import { Container, Message } from "./styles";

type Props = {
    messages: string
}

export function ListEmpty({messages}: Props) {
  return (
    <Container>
        <Message>
            {messages}
        </Message>
    </Container>
  );
}