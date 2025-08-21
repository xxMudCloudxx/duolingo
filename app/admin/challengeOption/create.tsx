import {
  Create,
  TextInput,
  BooleanInput,
  ReferenceInput,
  required,
  SimpleForm,
} from "react-admin";

export const ChallengeOptionCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" label="Text" validate={required()} />
        <BooleanInput source="correct" label="Correct" />
        <ReferenceInput source="challengeId" reference="challenges" />
        <TextInput source="imgSrc" label="Image Source" />
        <TextInput source="audioSrc" label="Audio Source" />
      </SimpleForm>
    </Create>
  );
};