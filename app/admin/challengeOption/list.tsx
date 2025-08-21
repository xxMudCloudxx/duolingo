import {
  Datagrid,
  List,
  TextField,
  ReferenceField,
  BooleanField,
  ImageField,
} from "react-admin";

export const ChallengeOptionList = () => {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="text" />
        <BooleanField source="correct" />
        <ReferenceField source="challengeId" reference="challenges" />
        <ImageField source="imgSrc" label="Image" />
        <TextField source="audioSrc" label="Audio" />
      </Datagrid>
    </List>
  );
};