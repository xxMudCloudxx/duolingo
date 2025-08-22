import { Datagrid, List, TextField } from "react-admin";

export const CourseList = () => {
  return (
    <List perPage={10} sort={{ field: "id", order: "ASC" }}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" />
        <TextField source="imgSrc" />
      </Datagrid>
    </List>
  );
};
