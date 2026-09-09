export const defaultSetting = {
  rules: {
    weights: {
      moral: 0.1,
      sport: 0.05,
      study: 0.6,
      ability: 0.1,
      art: 0.05,
      work: 0.1,
    },
    bases: {
      moral: 60,
      ability: 0,
      art: 60,
      work: 0,
    },
    formulas: {
      moral: {
        expression: "base+addsTotal-minusTotal",
        variables: ["base", "addsTotal", "minusTotal"],
      },
      ability: {
        expression: "base+addsTotal-minusTotal",
        variables: ["base", "addsTotal", "minusTotal"],
      },
      art: {
        expression: "base*0.7+addsTotal-minusTotal",
        variables: ["base", "addsTotal", "minusTotal"],
      },
      work: {
        expression: "addsTotal-minusTotal",
        variables: ["addsTotal", "minusTotal"],
      },
      sport: {
        withClass: {
          expression: "(fitness*0.6+(classA+classB)/2*0.4)*0.7",
          variables: ["fitness", "classA", "classB"],
        },
        withoutClass: {
          expression: "fitness*0.7+exercise*0.3",
          variables: ["fitness", "exercise"],
        },
      },
    },
  },
};

export const FORMULA_DEFAULTS = {
  moral: {
    expression: "base+addsTotal-minusTotal",
    variables: ["base", "addsTotal", "minusTotal"],
  },
  ability: {
    expression: "base+addsTotal-minusTotal",
    variables: ["base", "addsTotal", "minusTotal"],
  },
  art: {
    expression: "base*0.7+addsTotal-minusTotal",
    variables: ["base", "addsTotal", "minusTotal"],
  },
  work: {
    expression: "addsTotal-minusTotal",
    variables: ["addsTotal", "minusTotal"],
  },
  sport: {
    withClass: {
      expression: "(fitness*0.6+(classA+classB)/2*0.4)*0.7",
      variables: ["fitness", "classA", "classB"],
    },
    withoutClass: {
      expression: "fitness*0.7+exercise*0.3",
      variables: ["fitness", "exercise"],
    },
  },
};
