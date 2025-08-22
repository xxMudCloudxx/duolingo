import {
  Datagrid,
  List,
  TextField,
  ReferenceField,
  BooleanField,
  useGetList,
  useListFilterContext,
} from "react-admin";
import { Card, CardContent } from "@mui/material";
import {
  ChallengesFilterList,
  CoursesFilterList,
  LessonsFilterList,
  UnitsFilterList,
} from "@/components/filiter-sidebar";

const ChallengeOptionFilterSidebar = () => {
  // 我们只需要 filterValues 来判断显示哪些列表
  const { filterValues } = useListFilterContext();

  const courseIds: number[] = filterValues.courseIds || [];
  const unitIds: number[] = filterValues.unitIds || [];
  const lessonIds: number[] = filterValues.lessonIds || [];

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

  const { data: challenges } = useGetList(
    "challenges",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
      filter: { lessonIds: lessonIds },
    },
    { enabled: lessonIds.length > 0 }
  );

  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <CoursesFilterList courses={courses!} />

        {courseIds.length > 0 && units && <UnitsFilterList units={units} />}

        {unitIds.length > 0 && lessons && (
          <LessonsFilterList lessons={lessons} />
        )}

        {/* Challenge 筛选 */}
        {lessonIds.length > 0 && challenges && (
          <ChallengesFilterList challenges={challenges} />
        )}
      </CardContent>
    </Card>
  );
};

export const ChallengeOptionList = () => {
  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "ASC" }}
      aside={<ChallengeOptionFilterSidebar />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="text" />
        <BooleanField source="correct" />
        <ReferenceField source="challengeId" reference="challenges" />
        <TextField source="imgSrc" label="Image" />
        <TextField source="audioSrc" label="Audio" />
      </Datagrid>
    </List>
  );
};
