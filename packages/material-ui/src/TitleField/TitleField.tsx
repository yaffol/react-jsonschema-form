import React from 'react';

import { FieldProps } from '@rjsf/core';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const TitleField = ({ title }: FieldProps) => (
  <>
    <Box mb={1} mt={1}>
      <Typography variant="h5">{title}</Typography>
    </Box>
  </>
);

export default TitleField;
