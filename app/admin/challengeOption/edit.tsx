import {
  Edit,
  NumberInput,
  TextInput,
  BooleanInput,
  ReferenceInput,
  required,
  SimpleForm,
} from "react-admin";

export const ChallengeOptionEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={required()} label="Id" />
        <TextInput source="text" label="Text" validate={required()} />
        <BooleanInput source="correct" label="Correct" />
        <ReferenceInput source="challengeId" reference="challenges" />
        <TextInput source="imgSrc" label="Image Source" />
        <TextInput source="audioSrc" label="Audio Source" />
      </SimpleForm>
    </Edit>
  );
};