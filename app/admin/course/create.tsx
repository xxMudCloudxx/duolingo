import { Create, required, SimpleForm, TextInput } from "react-admin";

export const CourseCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" label="Title" validate={required()} />
        <TextInput source="imgSrc" label="Image" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
