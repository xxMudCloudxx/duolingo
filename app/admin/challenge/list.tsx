import {
  Datagrid,
  List,
  NumberField,
  ReferenceField,
  TextField,
  SelectField,
  useListFilterContext,
  useGetList,
} from "react-admin";
import {
  CoursesFilterList,
  LessonsFilterList,
  UnitsFilterList,
} from "@/components/filiter-sidebar";

import { Card, CardContent } from "@mui/material";
const ChallengeFilterSidebar = () => {
  // 我们只需要 filterValues 来判断显示哪些列表
  const { filterValues } = useListFilterContext();

  const courseIds: number[] = filterValues.courseIds || [];
  const unitIds: number[] = filterValues.unitIds || [];

  const { data: courses } = useGetList("courses");

  const { data: units } = useGetList(
    "units",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
      filter: { courseIds: courseIds },
    },
    { enabled: courseIds.length > 0 }
  );

  const { data: lessons } = useGetList(
    "lessons",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
      filter: { unitIds: unitIds },
    },
    { enabled: unitIds.length > 0 }
  );

  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <CoursesFilterList courses={courses!} />

        {courseIds.length > 0 && units && <UnitsFilterList units={units} />}

        {unitIds.length > 0 && lessons && (
          <LessonsFilterList lessons={lessons} />
        )}
      </CardContent>
    </Card>
  );
};
export const ChallengeList = () => {
  return (
    <List
      perPage={10}
      sort={{ field: "order", order: "ASC" }}
      aside={<ChallengeFilterSidebar />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="question" />
        <SelectField
          source="type"
          choices={[
            { id: "SELECT", name: "SELECT" },
            { id: "ASSIST", name: "ASSIST" },
          ]}
        />
        <ReferenceField source="lessonId" reference="lessons" />
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};
