const it = function(desc, fn) {
  try {
    fn()
    console.log(desc);
  } catch (error) {
    console.log('\n');
    console.log(desc);
    console.error(error);

    process.exitCode = 1
  }
}

const assertEqual = function(result, expected) {
  if (result === expected) {
    console.log(".")
  } else {
    console.log("F")

    console.log("Expected: \n\n")
    console.log(expected)
    console.log("\n\n")
    console.log("Got: \n\n")
    console.log(result)
    console.log("------")

    process.exitCode = 1
  }
}

module.exports = {
  it,
  assertEqual
}
