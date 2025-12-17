// components/ProgressSteps.js
import React from 'react';
import { View, Text } from 'react-native';
import { g, colors } from '../styles/styles';

function Step({ index, label, state }) {
  const circleStyle = [
    g.stepCircle,
    state === 'active' && g.stepCircleActive,
    state === 'done' && g.stepCircleDone,
  ];

  const labelStyle = [
    g.stepLabel,
    state === 'active' && g.stepLabelActive,
    state === 'done' && g.stepLabelDone,
  ];

  // Gør tallet tydeligt i alle tilstande
  const numberStyle = [
    g.stepNumber,
    state === 'idle' && { color: colors.textMuted },     // grå på mørk baggrund
    state === 'active' && { color: '#065f46' },          // mørkegrøn på lys grøn cirkel
    state === 'done' && { color: colors.textInverse },   // hvid på grøn cirkel
  ];

  return (
    <View style={g.stepItem}>
      <View style={circleStyle}>
        <Text style={numberStyle}>{index}</Text>
      </View>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}

export default function ProgressSteps({ current = 'sport', style }) {
  // Beregn tilstande for hvert trin
  const states = { sport: 'idle', venue: 'idle', book: 'idle' };
  if (current === 'sport') states.sport = 'active';
  if (current === 'venue') { states.sport = 'done'; states.venue = 'active'; }
  if (current === 'book')  { states.sport = 'done'; states.venue = 'done'; states.book = 'active'; }

  return (
    <View style={[g.progressTop, style]}>
      <View style={g.progressRow}>
        <Step index={1} label="Sport" state={states.sport} />
        <View style={[g.connector, (current !== 'sport') && g.connectorActive]} />
        <Step index={2} label="Venue" state={states.venue} />
        <View style={[g.connector, (current === 'book') && g.connectorActive]} />
        <Step index={3} label="Book" state={states.book} />
      </View>
    </View>
  );
}

