// Parser
//
// Exports a default function mapping the source code as a string to the AST.

import ohm from "ohm-js"
import * as ast from "./ast.js"

const aelGrammar = ohm.grammar(String.raw`Ael {
  Program   = Statement+
  Statement = let id "=" Exp                  --vardec
            | Var "=" Exp                     --assign
            | print Exp                       --print
  Exp       = Exp "==" Exp1                   --binary
            | Exp1
  Exp1      = Exp1 ("+" | "-") Term           --binary
            | Term
  Term      = Term ("*"| "/" | "%") Factor    --binary
            | Factor
  Factor    = ("-" | abs | sqrt) Factor       --unary
            | Expo
  Expo      = Expo "**" Highest               --binary
            | Highest
  Highest   = Var
            | num
            | "(" Exp ")"                     --parens
  Var       = id
  num       = digit+ ("." digit+)?
  let       = "let" ~alnum
  print     = "print" ~alnum
  abs       = "abs" ~alnum
  sqrt      = "sqrt" ~alnum
  keyword   = let | print | abs | sqrt
  id        = ~keyword letter alnum*
  space    += "//" (~"\n" any)* ("\n" | end)  --comment
}`)

const astBuilder = aelGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  Statement_vardec(_let, id, _eq, initializer) {
    return new ast.Variable(id.sourceString, initializer.ast())
  },
  Statement_assign(target, _eq, source) {
    return new ast.Assignment(target.ast(), source.ast())
  },
  Statement_print(_print, argument) {
    return new ast.PrintStatement(argument.ast())
  },
  Exp_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp1_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Expo_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Term_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Factor_unary(op, operand) {
    return new ast.UnaryExpression(op.sourceString, operand.ast())
  },
  Highest_parens(_open, expression, _close) {
    return expression.ast()
  },
  Var(id) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  num(_whole, _point, _fraction) {
    return Number(this.sourceString)
  },
})

export default function parse(sourceCode) {
  const match = aelGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}
